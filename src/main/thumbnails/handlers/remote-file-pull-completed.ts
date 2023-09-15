import { ipcMain } from 'electron';

import { createAndUploadThumbnail } from '../application/create-and-upload-thumbnail';

ipcMain.handle(
  'THUMBNAILS:CREATE_AND_UPDATE',
  async (_, fileAutoIncrementalId: number, localAbsolutePath: string) =>
    await createAndUploadThumbnail(fileAutoIncrementalId, localAbsolutePath)
);
