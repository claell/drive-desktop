import { FolderFinder } from '../../folders/application/FolderFinder';
import { FilePath } from '../domain/FilePath';
import { File } from '../domain/File';
import { FileSize } from '../domain/FileSize';
import { EventBus } from '../../shared/domain/EventBus';
import { VirtualContents } from '../../contents/domain/VirtualContents';
import { FileDeleter } from './FileDeleter';
import { PlatformPathConverter } from '../../shared/application/PlatformPathConverter';
import { FileRepository } from '../domain/FileRepository';
import {
  CreateParams,
  RemoteFileSystem,
} from '../domain/file-systems/RemoteFileSystem';
import { SyncEngineIpc } from '../../../../apps/sync-engine/ipcRendererSyncEngine';

export class FileCreator {
  constructor(
    private readonly remote: RemoteFileSystem,
    private readonly repository: FileRepository,
    private readonly folderFinder: FolderFinder,
    private readonly fileDeleter: FileDeleter,
    private readonly eventBus: EventBus,
    private readonly ipc: SyncEngineIpc
  ) {}

  async run(filePath: FilePath, contents: VirtualContents): Promise<File> {
    try {
      const existingFile = this.repository.searchByPartial({
        path: PlatformPathConverter.winToPosix(filePath.value),
      });

      if (existingFile) {
        await this.fileDeleter.run(existingFile.contentsId);
      }

      const folder = this.folderFinder.findFromFilePath(filePath);
      const size = new FileSize(contents.size);

      const fileParams: CreateParams = {
        name: filePath.name(),
        folderId: folder.id,
        size: size.value,
        contentsId: contents.id,
        path: filePath.value,
        type: filePath.extension(),
      };

      const persistedAttributes = await this.remote.create(fileParams);
      const file = File.create(persistedAttributes);

      await this.repository.upsert(file);

      await this.eventBus.publish(file.pullDomainEvents());
      this.ipc.send('FILE_CREATED', {
        name: file.name,
        extension: file.type,
        nameWithExtension: file.nameWithExtension,
      });

      return file;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown error';

      this.ipc.send('FILE_UPLOAD_ERROR', {
        name: filePath.name(),
        extension: filePath.extension(),
        nameWithExtension: filePath.nameWithExtension(),
        error: message,
      });
      throw error;
    }
  }
}
