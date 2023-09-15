// import sharp from 'sharp';
import gm from 'gm';
import { Readable, Writable, pipeline } from 'stream';
import Logger from 'electron-log';

import { ThumbnailProperties } from '../domain/ThumbnailProperties';
import { promisify } from 'util';
const promisifiedPipeline = promisify(pipeline);

async function convert(readable: Readable): Promise<Buffer> {
  const bufferArray: any[] = [];

  const bufferWritter = new Writable({
    write: (chunk, _, callback) => {
      bufferArray.push(chunk);
      callback();
    },
  });

  await promisifiedPipeline(readable, bufferWritter);

  const buffer = Buffer.concat(bufferArray);

  return buffer;
}

export function reziseImage(file: Readable): Promise<Buffer> {
  //const sharpStream = sharp({ failOn: 'error' });
  /*const promises = [];

  const gm2 = (gm(file).resize(300, 300).stream()).read() as Buffer;
  promises.push(
    gm(file).resize(ThumbnailProperties.dimensions, ThumbnailProperties.dimensions).stream()
    sharpStream
      .clone()
      .resize(ThumbnailProperties.dimensions, ThumbnailProperties.dimensions)
      .png({ quality: 10, compressionLevel: 9 })
      .toBuffer()
  );*/

  //file.pipe(sharpStream);

  return new Promise((resolve, reject) => {
    gm(file)
      .resize(ThumbnailProperties.dimensions, ThumbnailProperties.dimensions)
      .stream((error, readable) => {
        if (error) {
          Logger.error('[GM]: ', error);
          reject(error);
        }
        resolve(convert(readable));
      });
  });
}
