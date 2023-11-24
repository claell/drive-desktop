import { File, FileAttributes } from '../File';

export type CreateParams = {
  name: string;
  folderId: number;
  size: number;
  contentsId: string;
  path: string;
  type: string;
};

export interface RemoteFileSystem {
  create(params: CreateParams): Promise<FileAttributes>;

  trash(contentsId: File['contentsId']): Promise<void>;

  move(file: File): Promise<void>;

  rename(file: File): Promise<void>;
}
