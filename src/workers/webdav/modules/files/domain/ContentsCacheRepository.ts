import { Readable } from 'stream';
import { FileId } from './FileId';

export interface ContentsCacheRepository {
  exists(fileId: FileId): boolean;

  read(fileId: FileId): Readable;

  write(fileId: FileId, content: Readable, size: number): Promise<void>;

  delete(fileId: FileId): Promise<void>;

  usage(): Promise<number>;
}
