import { LocalContents } from '../../../../../src/context/local-drive/contents/domain/LocalContents';
import { LocalFileSystem } from '../../../../../src/context/local-drive/contents/domain/LocalFileSystem';

export class LocalFileSystemMock implements LocalFileSystem {
  public writeMock = jest.fn();
  public removeMock = jest.fn();
  public existsMock = jest.fn();

  write(contents: LocalContents): Promise<string> {
    return this.writeMock(contents);
  }
  remove(path: string): Promise<void> {
    return this.removeMock(path);
  }
  exists(path: string): Promise<boolean> {
    return this.existsMock(path);
  }
}
