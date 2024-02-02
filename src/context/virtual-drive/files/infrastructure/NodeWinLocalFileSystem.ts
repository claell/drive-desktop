import { VirtualDrive } from 'virtual-drive/dist';
import { FileStatuses } from '../../files/domain/FileStatus';
import { File } from '../domain/File';
import { LocalFileSystem } from '../domain/file-systems/LocalFileSystem';
import { RelativePathToAbsoluteConverter } from '../../shared/application/RelativePathToAbsoluteConverter';
import fs from 'fs/promises';
import Logger from 'electron-log';

export class NodeWinLocalFileSystem implements LocalFileSystem {
  constructor(
    private readonly virtualDrive: VirtualDrive,
    private readonly relativePathToAbsoluteConverter: RelativePathToAbsoluteConverter
  ) {}

  async getLocalFileId(file: File): Promise<`${string}-${string}`> {
    const win32AbsolutePath = this.relativePathToAbsoluteConverter.run(
      file.path
    );

    const { ino, dev } = await fs.stat(win32AbsolutePath);

    return `${dev}-${ino}`;
  }

  async createPlaceHolder(file: File): Promise<void> {
    if (!file.hasStatus(FileStatuses.EXISTS)) {
      return;
    }

    this.virtualDrive.createFileByPath(
      file.path,
      file.placeholderId,
      file.size,
      file.createdAt.getTime(),
      file.updatedAt.getTime()
    );
  }

  async updateSyncStatus(file: File): Promise<void> {
    const win32AbsolutePath = this.relativePathToAbsoluteConverter.run(
      file.path
    );
    Logger.debug(`Updating sync status file ${win32AbsolutePath}`);
    return this.virtualDrive.updateSyncStatus(win32AbsolutePath, false);
  }
}
