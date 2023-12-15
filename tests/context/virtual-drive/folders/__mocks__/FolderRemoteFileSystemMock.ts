import {
  Folder,
  FolderAttributes,
} from '../../../../../src/context/virtual-drive/folders/domain/Folder';
import { OfflineFolder } from '../../../../../src/context/virtual-drive/folders/domain/OfflineFolder';
import { RemoteFolderSystem } from '../../../../../src/context/virtual-drive/folders/domain/file-systems/RemoteFolderSystem';

export class FolderRemoteFileSystemMock implements RemoteFolderSystem {
  public readonly persistMock = jest.fn();
  public readonly trashMock = jest.fn();
  public readonly moveMock = jest.fn();
  public readonly renameMock = jest.fn();

  persist(offline: OfflineFolder): Promise<FolderAttributes> {
    return this.persistMock(offline);
  }
  trash(id: number): Promise<void> {
    return this.trashMock(id);
  }
  move(folder: Folder): Promise<void> {
    return this.moveMock(folder);
  }
  rename(folder: Folder): Promise<void> {
    return this.renameMock(folder);
  }
}
