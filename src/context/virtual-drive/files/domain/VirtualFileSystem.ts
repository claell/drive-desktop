import { VirtualFile } from './VirtualFile';

export interface VirtualFileSystem {
  createPlaceHolder(file: VirtualFile): Promise<void>;

  getLocalFileId(file: VirtualFile): Promise<`${string}-${string}`>;

  exists(file: VirtualFile): Promise<boolean>;

  rename(
    previousPath: VirtualFile['path'],
    path: VirtualFile['path']
  ): Promise<void>;

  delete(path: VirtualFile['path']): Promise<void>;
}
