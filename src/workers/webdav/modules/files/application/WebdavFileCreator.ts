import { PassThrough, Writable } from 'stream';
import { WebdavFolderFinder } from '../../folders/application/WebdavFolderFinder';
import { FilePath } from '../domain/FilePath';
import { RemoteFileContentsManagersFactory } from '../domain/RemoteFileContentsManagersFactory';
import { ItemMetadata } from '../../shared/domain/ItemMetadata';
import { FileMetadataCollection } from '../domain/FileMetadataCollection';
import { WebdavFile } from '../domain/WebdavFile';
import { WebdavFileRepository } from '../domain/WebdavFileRepository';
import { WebdavFolder } from '../../folders/domain/WebdavFolder';
import { FileSize } from '../domain/FileSize';
import { WebdavServerEventBus } from '../../shared/domain/WebdavServerEventBus';
import { ContentFileUploader } from '../domain/ContentFileUploader';
import { WebdavIpc } from '../../../ipc';
import { FileId } from '../domain/FileId';
import { ContentsId } from '../domain/ContentsId';

export class WebdavFileCreator {
  constructor(
    private readonly repository: WebdavFileRepository,
    private readonly folderFinder: WebdavFolderFinder,
    private readonly remoteContentsManagersFactory: RemoteFileContentsManagersFactory,
    private readonly temporalFileCollection: FileMetadataCollection,
    private readonly eventBus: WebdavServerEventBus,
    private readonly ipc: WebdavIpc
  ) {}

  private registerEvents(
    uploader: ContentFileUploader,
    metadata: ItemMetadata
  ) {
    uploader.on('start', () => {
      this.ipc.send('WEBDAV_FILE_UPLOADING', {
        name: metadata.name,
        extension: metadata.extension,
        nameWithExtension:
          metadata.name +
          (metadata.extension.length >= 0 ? '.' + metadata.extension : ''),
        size: metadata.size,
        processInfo: { elapsedTime: uploader.elapsedTime() },
      });
    });

    uploader.on('progress', (progress: number) => {
      this.ipc.send('WEBDAV_FILE_UPLOADING', {
        name: metadata.name,
        extension: metadata.extension,
        nameWithExtension:
          metadata.name +
          (metadata.extension.length >= 0 ? '.' + metadata.extension : ''),
        size: metadata.size,
        processInfo: { elapsedTime: uploader.elapsedTime(), progress },
      });
    });

    uploader.on('error', (error: Error) => {
      this.ipc.send('WEBDAV_FILE_UPLOAD_ERROR', {
        name: metadata.name,
        extension: metadata.extension,
        nameWithExtension:
          metadata.name +
          (metadata.extension.length >= 0 ? '.' + metadata.extension : ''),
        error: error.message,
      });
    });

    uploader.on('finish', () => {
      this.ipc.send('WEBDAV_FILE_UPLOADED', {
        name: metadata.name,
        extension: metadata.extension,
        nameWithExtension:
          metadata.name +
          (metadata.extension.length >= 0 ? '.' + metadata.extension : ''),
        size: metadata.size,
        processInfo: { elapsedTime: uploader.elapsedTime() },
      });
    });
  }

  private async createFileEntry(
    contentsId: ContentsId,
    folder: WebdavFolder,
    size: number,
    filePath: FilePath
  ): Promise<WebdavFile> {
    const file = WebdavFile.create(contentsId, folder, size, filePath);

    await this.repository.add(file);

    this.temporalFileCollection.remove(filePath.value);

    await this.eventBus.publish(file.pullDomainEvents());

    return file;
  }

  async run(path: string, size: number): Promise<Writable> {
    const fileSize = new FileSize(size);
    const filePath = new FilePath(path);

    const metadata = ItemMetadata.from({
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: filePath.name(),
      size,
      extension: filePath.extension(),
      type: 'FILE',
    });

    this.temporalFileCollection.add(filePath.value, metadata);

    const folder = this.folderFinder.run(filePath.dirname());

    const stream = new PassThrough();

    const uploader = this.remoteContentsManagersFactory.uploader(fileSize);

    this.registerEvents(uploader, metadata);

    const upload = uploader.upload(stream, fileSize.value);

    upload
      .then(async (id) => {
        return this.createFileEntry(id, folder, size, filePath);
      })
      .catch((error: Error) => {
        this.ipc.send('WEBDAV_FILE_UPLOAD_ERROR', {
          name: metadata.name,
          extension: metadata.extension,
          nameWithExtension:
            metadata.name +
            (metadata.extension.length >= 0 ? '.' + metadata.extension : ''),
          error: error.message,
        });
      });

    return stream;
  }
}
