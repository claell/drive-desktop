import { ContentFileDownloader } from './contentHandlers/ContentFileDownloader';
import { ContentFileUploader } from './contentHandlers/ContentFileUploader';
import { LocalContents } from '../../../local-drive/contents/domain/LocalContents';

export interface ContentsManagersFactory {
  downloader(): ContentFileDownloader;

  uploader(
    contents: LocalContents,
    abortSignal?: AbortSignal
  ): ContentFileUploader;
}
