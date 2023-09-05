import { exec } from 'child_process';
import Logger from 'electron-log';

function addNameExtension() {
  return new Promise<void>((resolve, reject) => {
    exec(
      'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012} /ve /t REG_SZ /d "Internxt" /f',
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error executing step 1: ${error}`);
          reject();
        }
        Logger.log(`Step 1: ${stdout}`);
        resolve();
        // Continue with other steps here...
      }
    );
  });
}

function display() {
  return new Promise<void>((resolve, reject) => {
    exec(
      'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012} /v System.IsPinnedToNameSpaceTree /t REG_DWORD /d 0x1 /f',
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error executing step 2: ${error}`);
          reject();
        }
        Logger.log(`Step 2: ${stdout}`);
        resolve();
        // Continue with other steps here...
      }
    );
  });
}

function setLocationForExtension() {
  return new Promise<void>((resolve, reject) => {
    exec(
      'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012} /v  SortOrderIndex /t REG_DWORD /d 0x42 /f',
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error executing step 3: ${error}`);
          reject();
        }
        Logger.log(`Step 3: ${stdout}`);
        resolve();
        // Continue with other steps here...
      }
    );
  });
}

function emulateShell32() {
  return new Promise<void>((resolve, reject) => {
    exec(
      'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012}\\InProcServer32 /ve /t REG_EXPAND_SZ /d %%systemroot%%system32shell32.dll /f',
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error executing step 4: ${error}`);
          reject();
        }
        Logger.log(`Step 4: ${stdout}`);
        resolve();
        // Continue with other steps here...
      }
    );
  });
}

function defineIntanceObject() {
  return new Promise<void>((resolve, reject) => {
    exec(
      'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012}\\Instance /v CLSID /t REG_SZ /d {0E5AAE11-A475-4c5b-AB00-C66DE400274E} /f',
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error executing step 5: ${error}`);
          reject();
        }
        Logger.log(`Step 5: ${stdout}`);
        resolve();
        // Continue with other steps here...
      }
    );
  });
}

function r(c: string, n: number) {
  return new Promise<void>((resolve, reject) => {
    exec(c, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Error executing step ${n}: ${error}`);
        reject();
      }
      Logger.log(`Step ${n}: ${stdout}`);
      resolve();
      // Continue with other steps here...
    });
  });
}

export async function run() {
  await addNameExtension();
  await display();
  await setLocationForExtension();
  await emulateShell32();
  await defineIntanceObject();
  await r(
    'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012}\\InstanceInitPropertyBag /v Attributes /t REG_DWORD /d 0x11 /f',
    6
  );
  await r(
    'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012}\\InstanceInitPropertyBag /v TargetFolderPath /t REG_EXPAND_SZ /d %%USERPROFILE%%\\InternxtDrive /f',
    7
  );
  await r(
    'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012}\\ShellFolder /v FolderValueFlags /t REG_DWORD /d 0x28 /f',
    8
  );
  await r(
    'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012}\\ShellFolder /v Attributes /t REG_DWORD /d 0xF080004D /f',
    9
  );

  await r(
    'reg add HKCU\\Software\\Classes\\CLSID\\{12345678-1234-1234-1234-123456789012} /ve /t REG_SZ /d MyCloudStorageApp /f',
    9
  );
  await r(
    'reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\HideDesktopIcons\\NewStartPanel /v {12345678-1234-1234-1234-123456789012} /t REG_DWORD /d 0x1 /f',
    10
  );
}
