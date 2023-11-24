import { ensureFolderExists } from '../../../../apps/shared/fs/ensure-folder-exists';
import { WriteReadableToFile } from '../../../../apps/shared/fs/write-readable-to-file';
import { LocalContents } from '../domain/LocalContents';
import { LocalFileContentsDirectoryProvider } from '../../../drive/shared/domain/LocalFileContentsDirectoryProvider';
import { LocalFileSystem } from '../domain/LocalFileSystem';
import path from 'path';
import { createReadStream, promises as fs, watch } from 'fs';
import Logger from 'electron-log';
import { Readable } from 'stream';

export class FSLocalFileSystem implements LocalFileSystem {
  private reading = new Map<string, AbortController>();

  constructor(
    private readonly locationProvider: LocalFileContentsDirectoryProvider,
    private readonly subfolder: string
  ) {}

  private async baseFolder(): Promise<string> {
    const location = await this.locationProvider.provide();

    return path.join(location, this.subfolder);
  }

  async write(contents: LocalContents, name?: string): Promise<string> {
    const folderPath = await this.baseFolder();
    ensureFolderExists(folderPath);

    const fileName = name || contents.nameWithExtension;

    const filePath = path.join(folderPath, fileName);

    await WriteReadableToFile.write(contents.stream, filePath);

    return filePath;
  }

  async remove(relativePath: string): Promise<void> {
    const folder = await this.baseFolder();

    const absolutePath = path.join(folder, relativePath);
    Logger.debug(' delete path,', absolutePath);
    return fs.rm(absolutePath);
  }

  async exists(relativePath: string): Promise<boolean> {
    const folder = await this.baseFolder();

    const absolutePath = path.join(folder, relativePath);

    try {
      Logger.debug(' exists path,', absolutePath);
      await fs.stat(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  private createAbortableStream(filePath: string): {
    readable: Readable;
    controller: AbortController;
  } {
    const isBeingRead = this.reading.get(filePath);

    if (isBeingRead) {
      isBeingRead.abort();
    }

    const readStream = createReadStream(filePath);

    const controller = new AbortController();

    this.reading.set(filePath, controller);

    return { readable: readStream, controller };
  }

  private extractNameAndExtension(nameWithExtension: string): [string, string] {
    if (nameWithExtension.startsWith('.')) {
      return [nameWithExtension, ''];
    }

    const [name, extension] = nameWithExtension.split('.');

    return [name, extension];
  }

  async contents(
    absoluteFilePath: string
  ): Promise<{ contents: LocalContents; abortSignal: AbortSignal }> {
    const { readable, controller } =
      this.createAbortableStream(absoluteFilePath);

    const { size, mtimeMs, birthtimeMs } = await fs.stat(absoluteFilePath);

    const absoluteFolderPath = path.dirname(absoluteFilePath);
    const nameWithExtension = path.basename(absoluteFilePath);

    const watcher = watch(absoluteFolderPath, (_, filename) => {
      if (filename !== nameWithExtension) {
        return;
      }
      Logger.warn(
        filename,
        ' has been changed during read, it will be aborted'
      );

      controller.abort();
    });

    readable.on('end', () => {
      watcher.close();
      this.reading.delete(absoluteFilePath);
    });

    readable.on('close', () => {
      this.reading.delete(absoluteFilePath);
    });

    const [name, extension] = this.extractNameAndExtension(nameWithExtension);

    const contents = LocalContents.from({
      name,
      extension,
      size,
      modifiedTime: mtimeMs,
      birthTime: birthtimeMs,
      contents: readable,
    });

    return {
      contents,
      abortSignal: controller.signal,
    };
  }
}
