import { ContentsManagersFactory } from '../../../../../src/context/virtual-drive/contents/domain/ContentsManagersFactory';
import { LocalContents } from '../../../../../src/context/local-drive/contents/domain/LocalContents';
import { ContentFileDownloader } from '../../../../../src/context/virtual-drive/contents/domain/contentHandlers/ContentFileDownloader';
import { ContentFileUploader } from '../../../../../src/context/virtual-drive/contents/domain/contentHandlers/ContentFileUploader';
import { ContentFileDownloaderMock } from './ContentFileDownloaderMock';
import { ContentFileUploaderMock } from './ContentFileUploaderMock';

export class RemoteFileContentsManagersFactoryMock
  implements ContentsManagersFactory
{
  public mockDownloader = new ContentFileDownloaderMock();
  public mockUpload = new ContentFileUploaderMock();

  downloader(): ContentFileDownloader {
    return this.mockDownloader;
  }

  uploader(
    _contents: LocalContents,
    _abortSignal?: AbortSignal | undefined
  ): ContentFileUploader {
    return this.mockUpload;
  }
}
