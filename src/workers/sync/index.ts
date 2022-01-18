import { ipcRenderer as electronIpcRenderer } from 'electron';
import Logger from 'electron-log';
import getListingStore from './listing-store';
import { getLocalFilesystem } from './filesystems/local-filesystem';
import { getRemoteFilesystem } from './filesystems/remote-filesystem';
import Sync, {
  ErrorDetails,
  FileSystemKind,
  SyncErrorName,
  SyncFatalError,
  SyncFatalErrorName,
  SyncResult,
} from './sync';

export type SyncArgs = {
  localPath: string;
  tmpPath: string;
  folderId: number;
};

type SyncAction =
  | 'PULL'
  | 'PULLED'
  | 'PULL_ERROR'
  | 'RENAME'
  | 'RENAMED'
  | 'RENAME_ERROR'
  | 'DELETE'
  | 'DELETED'
  | 'DELETE_ERROR'
  | 'METADATA_READ_ERROR';

export type SyncInfoUpdatePayload = {
  action: SyncAction;
  kind: FileSystemKind;
  name: string;
  progress?: number;
  errorName?: SyncErrorName;
  errorDetails?: ErrorDetails;
};

export interface SyncEvents {
  SYNC_INFO_UPDATE: (payload: SyncInfoUpdatePayload) => void;
  SYNC_FATAL_ERROR: (errorName: SyncFatalErrorName) => void;
  SYNC_EXIT: (result: SyncResult) => void;
}

interface IpcRenderer {
  send<U extends keyof SyncEvents>(
    event: U,
    ...args: Parameters<SyncEvents[U]>
  ): void;
  invoke(channel: 'get-sync-details'): Promise<SyncArgs>;
}

const ipcRenderer = electronIpcRenderer as IpcRenderer;

ipcRenderer
  .invoke('get-sync-details')
  .then(async ({ localPath, tmpPath, folderId }) => {
    const remote = getRemoteFilesystem(folderId);
    const local = getLocalFilesystem(localPath, tmpPath);

    const listingStore = getListingStore();

    const sync = new Sync(local, remote, listingStore);

    sync.on('SMOKE_TESTING', () => Logger.log('Smoke testing'));

    sync.on('CHECKING_LAST_RUN_OUTCOME', () =>
      Logger.log('Checking last run outcome')
    );
    sync.on('NEEDS_RESYNC', () => Logger.log('Needs resync'));

    sync.on('GENERATING_ACTIONS_NEEDED_TO_SYNC', () =>
      Logger.log('Generating actions needed to sync')
    );
    sync.on('PULLING_FILE', (name, progress, kind) => {
      Logger.debug(`Pulling file ${name} from ${kind}: ${progress * 100}%`);
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'PULL',
        kind,
        progress,
        name,
      });
    });

    sync.on('FILE_PULLED', (name, kind) => {
      Logger.debug(`File ${name} pulled from ${kind}`);
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'PULLED',
        kind,
        name,
      });
    });

    sync.on('ERROR_PULLING_FILE', (name, kind, errorName, errorDetails) => {
      Logger.error(
        `Error pulling file in ${kind} (${errorName}), details: ${JSON.stringify(
          errorDetails,
          null,
          2
        )}`
      );
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'PULL_ERROR',
        kind,
        name,
        errorName,
        errorDetails,
      });
    });

    sync.on('RENAMING_FILE', (oldName, newName, kind) => {
      Logger.debug(`Renaming file ${oldName} -> ${newName} in ${kind}`);
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'RENAME',
        kind,
        name: oldName,
      });
    });

    sync.on('FILE_RENAMED', (oldName, newName, kind) => {
      Logger.debug(`File ${oldName} renamed -> ${newName} in ${kind}`);
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'RENAMED',
        kind,
        name: oldName,
      });
    });

    sync.on(
      'ERROR_RENAMING_FILE',
      (oldName, newName, kind, errorName, errorDetails) => {
        Logger.error(
          `Error renaming file ${oldName} -> ${newName} in ${kind} (${errorName}), details: ${JSON.stringify(
            errorDetails,
            null,
            2
          )}`
        );
        ipcRenderer.send('SYNC_INFO_UPDATE', {
          action: 'RENAME_ERROR',
          kind,
          name: oldName,
          errorName,
          errorDetails,
        });
      }
    );

    sync.on('DELETING_FILE', (name, kind) => {
      Logger.debug(`Deleting file ${name} in ${kind}`);
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'DELETE',
        kind,
        name,
      });
    });

    sync.on('FILE_DELETED', (name, kind) => {
      Logger.debug(`Deleted file ${name} in ${kind}`);
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'DELETED',
        kind,
        name,
      });
    });

    sync.on('ERROR_DELETING_FILE', (name, kind, errorName, errorDetails) => {
      Logger.error(
        `Error deleting file ${name} in ${kind} (${errorName}), details: ${JSON.stringify(
          errorDetails,
          null,
          2
        )}`
      );
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'DELETE_ERROR',
        kind,
        name,
        errorName,
        errorDetails,
      });
    });

    sync.on('DELETING_FOLDER', (name, kind) => {
      Logger.debug(`Deleting folder ${name} in ${kind}`);
    });

    sync.on('FOLDER_DELETED', (name, kind) =>
      Logger.debug(`Deleted folder ${name} in ${kind}`)
    );

    sync.on('ERROR_DELETING_FOLDER', (name, kind, errorName, errorDetails) =>
      Logger.error(
        `Error deleting folder ${name} in ${kind} (${errorName}), details: ${JSON.stringify(
          errorDetails,
          null,
          2
        )}`
      )
    );

    sync.on('ERROR_READING_METADATA', (name, kind, errorName, errorDetails) => {
      Logger.error(
        `Error reading metadata ${name} in ${kind} (${errorName}), details: ${JSON.stringify(
          errorDetails,
          null,
          2
        )}`
      );
      ipcRenderer.send('SYNC_INFO_UPDATE', {
        action: 'METADATA_READ_ERROR',
        kind,
        name,
        errorName,
        errorDetails,
      });
    });

    sync.on('FINALIZING', () => {
      Logger.log('Finalizing sync');
    });

    try {
      const result = await sync.run();
      Logger.log('Sync done, result: ', result);
      ipcRenderer.send('SYNC_EXIT', result);
    } catch (err) {
      if (err instanceof SyncFatalError) {
        Logger.error(
          `Sync fatal error (${err.name}), details: ${JSON.stringify(
            err.details,
            null,
            2
          )}`
        );
        ipcRenderer.send('SYNC_FATAL_ERROR', err.name as SyncFatalErrorName);
      } else {
        Logger.error(
          'Completely unhandled sync fatal error',
          JSON.stringify(err, null, 2)
        );
        ipcRenderer.send('SYNC_FATAL_ERROR', 'UNKNOWN');
      }
    }
  });