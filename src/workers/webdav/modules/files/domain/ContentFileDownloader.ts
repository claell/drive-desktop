import { Readable } from 'stream';
import { FileId } from './FileId';
import { WebdavFile } from './WebdavFile';

export type FileDownloadEvents = {
  start: () => void;
  progress: (progress: number) => void;
  finish: (fileId: FileId) => void;
  error: (error: Error) => void;
};

export interface ContentFileDownloader {
  download(file: WebdavFile): Promise<Readable>;

  on(
    event: keyof FileDownloadEvents,
    handler: FileDownloadEvents[keyof FileDownloadEvents]
  ): void;

  elapsedTime(): number;
}
