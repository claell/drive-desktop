import { Readable } from 'stream';
import { ContentsId } from './ContentsId';

export type FileUploadEvents = {
  start: () => void;
  progress: (progress: number) => void;
  finish: (contentsId: ContentsId) => void;
  error: (error: Error) => void;
};

export interface ContentFileUploader {
  upload(contents: Readable, size: number): Promise<ContentsId>;

  on(
    event: keyof FileUploadEvents,
    fn: FileUploadEvents[keyof FileUploadEvents]
  ): void;

  elapsedTime(): number;
}
