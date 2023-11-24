import { ContentFileUploader } from '../domain/contentHandlers/ContentFileUploader';
import { ContentsManagersFactory } from '../domain/ContentsManagersFactory';
import { VirtualContents } from '../domain/VirtualContents';
import { LocalContents } from '../../../local-drive/contents/domain/LocalContents';
import { SyncEngineIpc } from '../../../../apps/sync-engine/ipcRendererSyncEngine';

export class ContentsUploader {
  constructor(
    private readonly remoteContentsManagersFactory: ContentsManagersFactory,
    private readonly ipc: SyncEngineIpc
  ) {}

  private registerEvents(
    uploader: ContentFileUploader,
    localFileContents: LocalContents
  ) {
    uploader.on('start', () => {
      this.ipc.send('FILE_UPLOADING', {
        name: localFileContents.name,
        extension: localFileContents.extension,
        nameWithExtension: localFileContents.nameWithExtension,
        size: localFileContents.size,
        processInfo: { elapsedTime: uploader.elapsedTime() },
      });
    });

    uploader.on('progress', (progress: number) => {
      this.ipc.send('FILE_UPLOADING', {
        name: localFileContents.name,
        extension: localFileContents.extension,
        nameWithExtension: localFileContents.nameWithExtension,
        size: localFileContents.size,
        processInfo: { elapsedTime: uploader.elapsedTime(), progress },
      });
    });

    uploader.on('error', (error: Error) => {
      this.ipc.send('FILE_UPLOAD_ERROR', {
        name: localFileContents.name,
        extension: localFileContents.extension,
        nameWithExtension: localFileContents.nameWithExtension,
        error: error.message,
      });
    });

    uploader.on('finish', () => {
      this.ipc.send('FILE_UPLOADED', {
        name: localFileContents.name,
        extension: localFileContents.extension,
        nameWithExtension: localFileContents.nameWithExtension,
        size: localFileContents.size,
        processInfo: { elapsedTime: uploader.elapsedTime() },
      });
    });
  }

  async run(
    contents: LocalContents,
    abortSignal: AbortSignal
  ): Promise<VirtualContents> {
    // const win32RelativePath =
    //   PlatformPathConverter.posixToWin(posixRelativePath);

    // const absolutePath =
    //   this.relativePathToAbsoluteConverter.run(win32RelativePath);

    // const { contents, abortSignal } = await this.contentProvider.contents(
    //   absolutePath
    // );

    const uploader = this.remoteContentsManagersFactory.uploader(
      contents,
      abortSignal
    );

    this.registerEvents(uploader, contents);

    const contentsId = await uploader.upload(contents.stream, contents.size);

    const fileContents = VirtualContents.create(contentsId, contents.size);

    return fileContents;
  }
}
