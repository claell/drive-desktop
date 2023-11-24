import { NotifyMainProcessHydrationFinished } from '../../../../../context/drive/contents/application/NotifyMainProcessHydrationFinished';
import { RetryContentsUploader } from '../../../../../context/drive/contents/application/RetryContentsUploader';
import { ContentsDownloader } from '../../../../../context/drive/contents/application/download/ContentsDownloader';
import { LocalFileContentsDirectoryProvider } from '../../../../../context/drive/shared/domain/LocalFileContentsDirectoryProvider';

export interface ContentsContainer {
  contentsUploader: RetryContentsUploader;
  contentsDownloader: ContentsDownloader;
  localFileContentsDirectoryProvider: LocalFileContentsDirectoryProvider;
  notifyMainProcessHydrationFinished: NotifyMainProcessHydrationFinished;
}
