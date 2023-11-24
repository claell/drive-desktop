import { DownloadContentsToPlainFile } from '../../../../context/virtual-drive/contents/application/download/DownloadContentsToPlainFile';
import { LocalContentsDeleter } from '../../../../context/local-drive/contents/application/LocalContentsDeleter';

export interface ContentsContainer {
  downloadContentsToPlainFile: DownloadContentsToPlainFile;
  localContentsDeleter: LocalContentsDeleter;
}
