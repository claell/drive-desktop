import { Folder } from './Folder';

// TODO: separate the folder repository to the remote actions with this interface
export interface FolderManagementSystem {
  delete(folder: Folder): Promise<void>;
}
