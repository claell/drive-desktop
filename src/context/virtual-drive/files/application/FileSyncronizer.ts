import { RemoteFileContents } from '../../contents/domain/RemoteFileContents';
import { PlatformPathConverter } from '../../shared/application/PlatformPathConverter';
import { FilePath } from '../domain/FilePath';
import { FileRepository } from '../domain/FileRepository';
import { FileStatuses } from '../domain/FileStatus';
import Logger from 'electron-log';
import { FileCreator } from './FileCreator';
import { AbsolutePathToRelativeConverter } from '../../shared/application/AbsolutePathToRelativeConverter';
import { FolderNotFoundError } from '../../folders/domain/errors/FolderNotFoundError';
import { OfflineFolderCreator } from '../../folders/application/Offline/OfflineFolderCreator';
import { Folder } from '../../folders/domain/Folder';
import * as fs from 'fs';
import { File } from '../domain/File';
import { FileSyncStatusUpdater } from './FileSyncStatusUpdater';
import { FilePlaceholderConverter } from './FIlePlaceholderConverter';
import { FileContentsUpdater } from './FileContentsUpdater';
import { FolderCreatorFromOfflineFolder } from '../../folders/application/FolderCreatorFromOfflineFolder';

export class FileSynchronizer {
  // queue of files to be uploaded
  private foldersPathQueue: string[] = [];
  constructor(
    private readonly repository: FileRepository,
    private readonly fileSyncStatusUpdater: FileSyncStatusUpdater,
    private readonly filePlaceholderConverter: FilePlaceholderConverter,
    private readonly fileCreator: FileCreator,
    private readonly absolutePathToRelativeConverter: AbsolutePathToRelativeConverter,
    private readonly folderCreator: FolderCreatorFromOfflineFolder,
    private readonly offlineFolderCreator: OfflineFolderCreator,
    private readonly fileContentsUpdater: FileContentsUpdater
  ) {}

  async run(
    absolutePath: string,
    upload: (path: string) => Promise<RemoteFileContents>
  ): Promise<void> {
    const win32RelativePath =
      this.absolutePathToRelativeConverter.run(absolutePath);

    const posixRelativePath =
      PlatformPathConverter.winToPosix(win32RelativePath);

    const path = new FilePath(posixRelativePath);

    const existingFile = this.repository.matchingPartial({
      path: PlatformPathConverter.winToPosix(path.value),
      status: FileStatuses.EXISTS,
    })[0];

    await this.sync(
      existingFile,
      absolutePath,
      posixRelativePath,
      path,
      upload
    );
  }

  private async sync(
    existingFile: File | undefined,
    absolutePath: string,
    posixRelativePath: string,
    path: FilePath,
    upload: (path: string) => Promise<RemoteFileContents>
  ) {
    if (existingFile) {
      if (this.hasDifferentSize(existingFile, absolutePath)) {
        const contents = await upload(posixRelativePath);
        existingFile = await this.fileContentsUpdater.run(
          existingFile,
          contents.id,
          contents.size
        );
        Logger.info('existingFile ', existingFile);
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
    attempts = 3
  ) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fileContents = await upload(posixRelativePath);
      const createdFile = await this.fileCreator.run(
        filePath,
        fileContents.id,
        fileContents.size
      );
      await this.convertAndUpdateSyncStatus(createdFile);
    } catch (error: unknown) {
      Logger.error('Error creating file:', error);
      if (error instanceof FolderNotFoundError) {
        await this.createFolderFather(posixRelativePath);
      }
      if (attempts > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.retryCreation(
          posixRelativePath,
          filePath,
          upload,
          attempts - 1
        );
        return;
      }
    }
  };

  private async runFolderCreator(posixRelativePath: string): Promise<Folder> {
    const offlineFolder = await this.offlineFolderCreator.run(
      posixRelativePath
    );
    return this.folderCreator.run(offlineFolder);
  }

  private async createFolderFather(posixRelativePath: string) {
    Logger.info('posixRelativePath', posixRelativePath);
    const posixDir =
      PlatformPathConverter.getFatherPathPosix(posixRelativePath);
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await this.runFolderCreator(posixDir);
    } catch (error) {
      Logger.error('Error creating folder father creation:', error);
      if (error instanceof FolderNotFoundError) {
        this.foldersPathQueue.push(posixDir);
        // father created
        await this.createFolderFather(posixDir);
        // child created
        Logger.info('Creating child', posixDir);
        await this.retryFolderCreation(posixDir);
      } else {
        Logger.error(
          'Error creating folder father creation inside catch:',
          error
        );
        throw error;
      }
    }
  }

  private hasDifferentSize(file: File, absolutePath: string) {
    const stats = fs.statSync(absolutePath);
    return Math.abs(file.size - stats.size) > 0.001;
  }

  private async convertAndUpdateSyncStatus(file: File) {
    await Promise.all([
      this.filePlaceholderConverter.run(file),
      this.fileSyncStatusUpdater.run(file),
    ]);
  }

  private retryFolderCreation = async (posixDir: string, attempts = 3) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await this.runFolderCreator(posixDir);
    } catch (error) {
      Logger.error('Error creating folder father creation:', error);
      if (attempts > 0) {
        await this.retryFolderCreation(posixDir, attempts - 1);
        return;
      }
    }
  };
}
