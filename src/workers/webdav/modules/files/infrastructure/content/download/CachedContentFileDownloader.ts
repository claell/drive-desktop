import { Readable } from 'stream';
import {
  ContentFileDownloader,
  FileDownloadEvents,
} from '../../../domain/ContentFileDownloader';
import { ContentsCacheRepository } from '../../../domain/ContentsCacheRepository';
import { WebdavFile } from '../../../domain/WebdavFile';
import Logger from 'electron-log';

export class CachedContentFileDownloader implements ContentFileDownloader {
  elapsedTime: () => number;
  on: (
    event: keyof FileDownloadEvents,
    handler: FileDownloadEvents[keyof FileDownloadEvents]
  ) => void;

  constructor(
    private readonly fileDownloader: ContentFileDownloader,
    private readonly cachedRepository: ContentsCacheRepository
  ) {
    this.on = fileDownloader.on.bind(fileDownloader);
    this.elapsedTime = fileDownloader.elapsedTime.bind(fileDownloader);
  }

  async download(file: WebdavFile): Promise<Readable> {
    const isCached = await this.cachedRepository.exists(file.id);

    if (isCached) {
      Logger.info(`File with id ${file.id} is cached. Skiping downloading it.`);
      return this.cachedRepository.read(file.id);
    }

    const contents = await this.fileDownloader.download(file);

    this.cachedRepository.write(file.id, contents, file.size).catch((error) => {
      Logger.error('Error caching file: ', file.id, error);
    });

    return contents;
  }
}
