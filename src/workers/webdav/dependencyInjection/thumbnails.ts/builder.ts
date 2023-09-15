import { ThumbnailCreator } from '../../modules/thumbnails/application/ThumbnailCreator';
import { ThumbnailsContainer } from './thumbnailsContainer';
import { ipcRenderer } from 'electron';

export function buildThumbnailsContainer(): ThumbnailsContainer {
  const creator = new ThumbnailCreator(ipcRenderer);

  return {
    thumbnailCreator: creator,
  };
}
