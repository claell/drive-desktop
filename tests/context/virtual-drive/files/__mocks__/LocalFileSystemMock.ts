import { VirtualFile } from '../../../../../src/context/virtual-drive/files/domain/VirtualFile';
import { VirtualFileSystem } from '../../../../../src/context/virtual-drive/files/domain/VirtualFileSystem';

export class LocalFileSystemMock implements VirtualFileSystem {
  public readonly createPlaceHolderMock = jest.fn();
  public readonly getLocalFileIdMock = jest.fn();
  public readonly existsMock = jest.fn();
  public readonly renameMock = jest.fn();
  public readonly deleteMock = jest.fn();

  createPlaceHolder(file: VirtualFile): Promise<void> {
    return this.createPlaceHolderMock(file);
  }
  getLocalFileId(file: VirtualFile): Promise<`${string}-${string}`> {
    return this.getLocalFileIdMock(file);
  }
  exists(file: VirtualFile): Promise<boolean> {
    return this.existsMock(file);
  }
  rename(previousPath: string, path: string): Promise<void> {
    return this.renameMock(previousPath, path);
  }
  delete(path: string): Promise<void> {
    return this.deleteMock(path);
  }
}
