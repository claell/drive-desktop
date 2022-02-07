import { aes } from '@internxt/lib';
import { dialog } from 'electron';
import fetch from 'electron-fetch';
import os from 'os';
import path from 'path';

import { getHeaders } from '../auth/service';
import configStore from '../config';

export type Device = { name: string; id: number; bucket: string };

export async function getOrCreateDevice() {
  async function createDevice(deviceName: string) {
    return fetch(`${process.env.API_URL}/api/backup/deviceAsFolder`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ deviceName }),
    });
  }

  async function tryToCreateDeviceWithDifferentNames(): Promise<Device> {
    let res = await createDevice(os.hostname());

    let i = 1;

    while (res.status === 409 && i <= 10) {
      res = await createDevice(`${os.hostname()} (${i})`);
      i++;
    }

    if (!res.ok)
      res = await createDevice(
        `${os.hostname()} (${new Date().valueOf() % 1000})`
      );

    if (res.ok) {
      return res.json();
    } else {
      throw new Error('Could not create device trying different names');
    }
  }

  const savedDeviceId = configStore.get('deviceId');

  const deviceIsDefined = savedDeviceId !== -1;

  let newDevice: Device | null = null;

  if (deviceIsDefined) {
    const res = await fetch(
      `${process.env.API_URL}/api/backup/deviceAsFolder/${savedDeviceId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    if (res.ok) return decryptDeviceName(await res.json());
    else if (res.status === 404)
      newDevice = await tryToCreateDeviceWithDifferentNames();
  } else {
    newDevice = await tryToCreateDeviceWithDifferentNames();
  }

  if (newDevice) {
    configStore.set('deviceId', newDevice.id);
    configStore.set('backupList', {});

    return decryptDeviceName(newDevice);
  } else {
    throw new Error('Could not get or create device');
  }
}

export async function renameDevice(deviceName: string): Promise<Device> {
  const deviceId = getDeviceId();

  const res = await fetch(
    `${process.env.API_URL}/api/backup/deviceAsFolder/${deviceId}`,
    {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ deviceName }),
    }
  );
  if (res.ok) return decryptDeviceName(await res.json());
  else throw new Error('Error in the request to rename a device');
}

function decryptDeviceName({ name, ...rest }: Device): Device {
  return {
    name: aes.decrypt(name, `${process.env.NEW_CRYPTO_KEY}-${rest.bucket}`),
    ...rest,
  };
}

export type Backup = { id: number; name: string };

export async function getBackupsFromDevice(): Promise<Backup[]> {
  const deviceId = getDeviceId();

  const folder = await fetchFolder(deviceId);

  const backupsList = configStore.get('backupList');

  return folder.children.filter((backup: Backup) => {
    const pathname = findBackupPathnameFromId(backup.id);

    return pathname && backupsList[pathname].enabled;
  });
}

export async function addBackup(): Promise<void> {
  async function createBackup(pathname: string): Promise<void> {
    const { name } = path.parse(pathname);
    const newBackup = await postBackup(name);

    const backupList = configStore.get('backupList');

    backupList[pathname] = { enabled: true, folderId: newBackup.id };

    configStore.set('backupList', backupList);
  }

  async function postBackup(name: string): Promise<Backup> {
    const deviceId = getDeviceId();

    const res = await fetch(`${process.env.API_URL}/api/storage/folder`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ parentFolderId: deviceId, folderName: name }),
    });
    if (res.ok) return res.json();
    else throw new Error('Post backup request wasnt successful');
  }

  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (result.canceled) return;

  let chosenPath = result.filePaths[0];
  chosenPath += chosenPath[chosenPath.length - 1] === path.sep ? '' : path.sep;

  const backupList = configStore.get('backupList');

  const existingBackup = backupList[chosenPath];

  if (!existingBackup) {
    return createBackup(chosenPath);
  }

  let folderStillExists;
  try {
    await fetchFolder(existingBackup.folderId);
    folderStillExists = true;
  } catch {
    folderStillExists = false;
  }

  if (folderStillExists) {
    backupList[chosenPath].enabled = true;
    configStore.set('backupList', backupList);
  } else {
    return createBackup(chosenPath);
  }
}

async function fetchFolder(folderId: number) {
  const res = await fetch(
    `${process.env.API_URL}/api/storage/v2/folder/${folderId}`,
    {
      method: 'GET',
      headers: getHeaders(true),
    }
  );

  if (res.ok) return res.json();
  else throw new Error('Unsuccesful request to fetch folder');
}

export async function deleteBackup(backup: Backup): Promise<void> {
  const res = await fetch(
    `${process.env.API_URL}/api/storage/folder/${backup.id}`,
    {
      method: 'DELETE',
      headers: getHeaders(true),
    }
  );
  if (!res.ok) throw new Error('Request to delete backup wasnt succesful');

  const backupsList = configStore.get('backupList');

  const entriesFiltered = Object.entries(backupsList).filter(
    ([, b]) => b.folderId !== backup.id
  );

  const backupListFiltered = Object.fromEntries(entriesFiltered);

  configStore.set('backupList', backupListFiltered);
}

export async function disableBackup(backup: Backup): Promise<void> {
  const backupsList = configStore.get('backupList');
  const pathname = findBackupPathnameFromId(backup.id)!;

  backupsList[pathname].enabled = false;

  configStore.set('backupList', backupsList);
}

function findBackupPathnameFromId(id: number): string | undefined {
  const backupsList = configStore.get('backupList');
  const entryfound = Object.entries(backupsList).find(
    ([, b]) => b.folderId === id
  );

  return entryfound?.[0];
}

function getDeviceId(): number {
  const deviceId = configStore.get('deviceId');

  if (deviceId === -1) throw new Error('deviceId is not defined');

  return deviceId;
}