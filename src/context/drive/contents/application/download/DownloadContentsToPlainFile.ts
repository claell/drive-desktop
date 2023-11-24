import { broadcastToWindows } from '../../../../../apps/main/windows';
import { File } from '../../../files/domain/File';
import { EventBus } from '../../../shared/domain/EventBus';
import { ContentsManagersFactory } from '../../domain/ContentsManagersFactory';
import { LocalContents } from '../../../../local-drive/contents/domain/LocalContents';
import { LocalFileSystem } from '../../../../local-drive/contents/domain/LocalFileSystem';
import { ContentFileDownloader } from '../../domain/contentHandlers/ContentFileDownloader';

export class DownloadContentsToPlainFile {
  constructor(
    private readonly managerFactory: ContentsManagersFactory,
    private readonly localWriter: LocalFileSystem,
    private readonly eventBus: EventBus
  ) {}

  private async registerEvents(downloader: ContentFileDownloader, file: File) {
    downloader.on('start', () => {
      broadcastToWindows('sync-info-update', {
        action: 'DOWNLOADING',
        name: file.nameWithExtension,
        progress: 0,
      });
    });

    downloader.on('progress', (progress: number) => {
      broadcastToWindows('sync-info-update', {
        action: 'DOWNLOADING',
        name: file.nameWithExtension,
        progress: progress,
      });
    });

    downloader.on('error', () => {
      broadcastToWindows('sync-info-update', {
        action: 'DOWNLOAD_ERROR',
        name: file.nameWithExtension,
      });
    });

    downloader.on('finish', () => {
      broadcastToWindows('sync-info-update', {
        action: 'DOWNLOADED',
        name: file.nameWithExtension,
      });
    });
  }

  async run(file: File): Promise<string> {
    const downloader = this.managerFactory.downloader();

    this.registerEvents(downloader, file);

    const readable = await downloader.download(file);
    const localContents = LocalContents.downloadedFrom(file, readable);

    const write = await this.localWriter.write(localContents, file.contentsId);

    const events = localContents.pullDomainEvents();
    await this.eventBus.publish(events);

    return write;
  }
}
