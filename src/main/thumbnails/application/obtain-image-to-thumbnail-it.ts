import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

import configStore from '../../config';
import {
  isImageThumbnailable,
  isPdfThumbnailable,
} from '../domain/ThumbnableExtension';
import { extractFirstPageAsReadablePNG } from './extract-pdf-page';

function getExtension(pathLike: string) {
  const { ext } = path.parse(pathLike);

  return ext.replace('.', '');
}

export async function obtainImageToThumbnail(
  filePath: string
): Promise<Readable | undefined> {
  const ext = getExtension(filePath);

  if (isPdfThumbnailable(ext)) {
    return extractFirstPageAsReadablePNG(filePath);
  }

  if (isImageThumbnailable(ext)) {
    return createReadStream(filePath);
  }

  return undefined;
}
