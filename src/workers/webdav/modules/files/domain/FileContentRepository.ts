import { Readable } from 'stream';
import { FileId } from './FileId';
import { FileSize } from './FileSize';
import { RemoteFileContents } from './RemoteFileContent';
import { WebdavFile } from './WebdavFile';

export interface RemoteFileContentsRepository {
  clone(file: WebdavFile): Promise<FileId>;

  download(fileId: WebdavFile): Promise<RemoteFileContents>;

  upload(size: FileSize, contents: Readable): Promise<FileId>;
}
