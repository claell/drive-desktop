import { Environment } from '@internxt/inxt-js';
import { Storage, StorageTypes } from '@internxt/sdk/dist/drive';
import { Readable } from 'stream';

import { ThumbnailProperties } from '../domain/ThumbnailProperties';
import { ThumbnailUploader } from '../domain/ThumbnailUploader';

class BufferToReadableStream extends Readable {
  private buffer: Buffer;
  private pos: number;

  constructor(buffer: Buffer, options: any = {}) {
    super(options);
    this.buffer = buffer;
    this.pos = 0;
  }

  _read(size: number) {
    // Push data from the buffer until the buffer is exhausted
    if (this.pos >= this.buffer.length) {
      this.push(null); // No more data to push
    } else {
      const chunk = this.buffer.slice(this.pos, this.pos + size);
      this.pos += chunk.length;
      this.push(chunk);
    }
  }
}

export class EnvironmentAndStorageThumbnailUploader
  implements ThumbnailUploader
{
  constructor(
    private readonly environment: Environment,
    private readonly storage: Storage,
    private readonly bucket: string
  ) {}

  private uploadThumbnail(thumbnail: Buffer) {
    const thumbnailStream = new BufferToReadableStream(thumbnail);

    return new Promise<string>((resolve, reject) => {
      this.environment.upload(this.bucket, {
        progressCallback: () => {
          // no op
        },
        finishedCallback: (err: unknown, id: string) => {
          if (err && !id) {
            reject(err);
          }

          resolve(id);
        },
        fileSize: thumbnail.byteLength,
        source: thumbnailStream,
      });
    });
  }

  async upload(fileId: number, thumbnailFile: Buffer): Promise<void> {
    const fileIdOnEnvironment = await this.uploadThumbnail(thumbnailFile);

    const thumbnail: StorageTypes.ThumbnailEntry = {
      file_id: fileId,
      max_width: ThumbnailProperties.dimensions as number,
      max_height: ThumbnailProperties.dimensions as number,
      type: ThumbnailProperties.type as string,
      size: thumbnailFile.byteLength,
      bucket_id: this.bucket,
      bucket_file: fileIdOnEnvironment,
      encrypt_version: StorageTypes.EncryptionVersion.Aes03,
    };

    await this.storage.createThumbnailEntry(thumbnail);
  }
}
