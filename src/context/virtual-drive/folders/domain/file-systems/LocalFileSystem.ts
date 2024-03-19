import { Folder } from '../Folder';

export interface LocalFileSystem {
  createPlaceHolder(folder: Folder): Promise<void>;

  updateSyncStatus(folder: Folder): Promise<void>;

  convertToPlaceholder(folder: Folder): Promise<void>;

  getFileIdentity(path: Folder['path']): Promise<string>;

  deleteFileSyncRoot(path: Folder['path']): Promise<void>;

  getPlaceholderState(folder: Folder): Promise<void>;
}
