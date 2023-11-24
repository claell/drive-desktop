import { DownloadContentsToPlainFile } from '../../../../context/virtual-drive/contents/application/download/DownloadContentsToPlainFile';
import { LocalContentChecker } from '../../../../context/local-drive/contents/application/LocalContentChecker';

export interface ContentsContainer {
  downloadContentsToPlainFile: DownloadContentsToPlainFile;
  localContentChecker: LocalContentChecker;
}
