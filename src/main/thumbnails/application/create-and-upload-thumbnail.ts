import Logger from 'electron-log';

import { ThumbnailUploaderFactory } from '../infrastructure/ThumbnailUploaderFactory';
import { obtainImageToThumbnail } from './obtain-image-to-thumbnail-it';
import { reziseImage } from './resize-image';

export async function createAndUploadThumbnail(
  fileAutoIncrementalId: number,
  path: string
) {
  const uploader = ThumbnailUploaderFactory.build();

  const image = await obtainImageToThumbnail(path);

  if (!image) {
    Logger.error(
      '[THUMBNAIL] Could not obtain an image to createa the thumbnail'
    );
    return;
  }

  const thumbnail = await reziseImage(image);

  if (!thumbnail) {
    Logger.error('[THUMBNAIL] Error rezising the image to a thumbnail');
    return;
  }

  if (thumbnail.byteLength === 0) {
    Logger.error(
      '[THUMBNAIL] Error rezising the image to a thumbnail, result image has 0 size'
    );
    return;
  }

  await uploader.upload(fileAutoIncrementalId, thumbnail).catch((err) => {
    Logger.error('[THUMBNAIL] Error uploading thumbnail: ', err);
  });
}
