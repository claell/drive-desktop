import { RemoteFileContents } from '../../contents/domain/RemoteFileContents';
import { PlatformPathConverter } from '../../shared/application/PlatformPathConverter';
import { FilePath } from '../domain/FilePath';
import { FileRepository } from '../domain/FileRepository';
import { FileStatuses } from '../domain/FileStatus';
import Logger from 'electron-log';
import { FileCreator } from './FileCreator';
import { AbsolutePathToRelativeConverter } from '../../shared/application/AbsolutePathToRelativeConverter';
import { FolderNotFoundError } from '../../folders/domain/errors/FolderNotFoundError';
import { FolderCreator } from '../../folders/application/FolderCreator';
import { OfflineFolderCreator } from '../../folders/application/Offline/OfflineFolderCreator';
import { Folder } from '../../folders/domain/Folder';
import * as fs from 'fs';
import { File } from '../domain/File';
import { FileSyncStatusUpdater } from './FileSyncStatusUpdater';
import { FilePlaceholderConverter } from './FIlePlaceholderConverter';
import { FoldersFatherSyncStatusUpdater } from '../../folders/application/FoldersFatherSyncStatusUpdater';
import { FolderCreatorFromOfflineFolder } from '../../folders/application/FolderCreatorFromOfflineFolder';

export class FileSyncronizer {
  constructor(
    private readonly repository: FileRepository,
    private readonly fileSyncStatusUpdater: FileSyncStatusUpdater,
    private readonly filePlaceholderConverter: FilePlaceholderConverter,
    private readonly fileCreator: FileCreator,
    private readonly absolutePathToRelativeConverter: AbsolutePathToRelativeConverter,
    private readonly folderCreator: FolderCreatorFromOfflineFolder,
    private readonly offlineFolderCreator: OfflineFolderCreator,
    private readonly foldersFatherSyncStatusUpdater: FoldersFatherSyncStatusUpdater
  ) {}

  async run(
    absolutePath: string,
    upload: (path: string) => Promise<RemoteFileContents>
  ) {
    const win32RelativePath =
      this.absolutePathToRelativeConverter.run(absolutePath);

    const posixRelativePath =
      PlatformPathConverter.winToPosix(win32RelativePath);

    const path = new FilePath(posixRelativePath);

    const existingFile = this.repository.searchByPartial({
      path: PlatformPathConverter.winToPosix(path.value),
      status: FileStatuses.EXISTS,
    });

    if (existingFile) {
      if (this.hasDifferentSize(existingFile, absolutePath)) {
        return;
      }
      await this.convertAndUpdateSyncStatus(existingFile);
    } else {
      await this.retryCreation(posixRelativePath, path, upload);
    }
  }

  private retryCreation = async (
    posixRelativePath: string,
    filePath: FilePath,
    upload: (path: string) => Promise<RemoteFileContents>,
    attemps = 3
  ) => {
    try {
      const fileContents = await upload(posixRelativePath);
      const createdFile = await this.fileCreator.run(
        filePath.value,
        fileContents.id,
        fileContents.size
      );
      await this.convertAndUpdateSyncStatus(createdFile);
    } catch (error: unknown) {
      Logger.error('Error creating file:', error);
      if (error instanceof FolderNotFoundError) {
        await this.createFolderFather(posixRelativePath);
      }
      if (attemps > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.retryCreation(
          posixRelativePath,
          filePath,
          upload,
          attemps - 1
        );
        return;
      }
    }
  };

  private async runFolderCreator(posixRelativePath: string): Promise<Folder> {
    const offlineFolder = this.offlineFolderCreator.run(posixRelativePath);
    return this.folderCreator.run(offlineFolder);
  }

  private async createFolderFather(posixRelativePath: string) {
    Logger.info('posixRelativePath', posixRelativePath);
    const posixDir =
      PlatformPathConverter.getFatherPathPosix(posixRelativePath);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.runFolderCreator(posixDir);
    } catch (error) {
      Logger.error('Error creating folder father creation:', error);
      if (error instanceof FolderNotFoundError) {
        // father created
        await this.createFolderFather(posixDir);
        // child created
        await this.runFolderCreator(posixDir);
      } else {
        Logger.error(
          'Error creating folder father creation inside catch:',
          error
        );
        throw error;
      }
    }
  }

  private hasDifferentSize(file: File, absoulthePath: string) {
    const stats = fs.statSync(absoulthePath);
    return Math.abs(file.size - stats.size) > 0.001;
  }

  private async convertAndUpdateSyncStatus(file: File) {
    await this.filePlaceholderConverter.run(file);
    await this.fileSyncStatusUpdater.run(file);
  }
}
