import { File } from './File';

// TODO: separate the file repository to the remote actions with this interface
export interface FileManagementSystem {
  delete(file: File): Promise<void>;
}
