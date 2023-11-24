import {
  File,
  FileAttributes,
} from '../../../../../src/context/virtual-drive/files/domain/File';
import { LocalFile } from '../../../../../src/context/local-drive/files/domain/LocalFile';
import { RemoteFileSystem } from '../../../../../src/context/virtual-drive/files/domain/file-systems/RemoteFileSystem';

export class RemoteFileSystemMock implements RemoteFileSystem {
  public readonly persistMock = jest.fn();
  public readonly trashMock = jest.fn();
  public readonly moveMock = jest.fn();
  public readonly renameMock = jest.fn();

  create(offline: LocalFile): Promise<FileAttributes> {
    return this.persistMock(offline);
  }

  trash(contentsId: string): Promise<void> {
    return this.trashMock(contentsId);
  }

  move(file: File): Promise<void> {
    return this.moveMock(file);
  }

  rename(file: File): Promise<void> {
    return this.renameMock(file);
  }
}
