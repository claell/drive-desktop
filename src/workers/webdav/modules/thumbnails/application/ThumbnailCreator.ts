import { IpcRenderer } from 'electron';

export class ThumbnailCreator {
  constructor(private readonly ipc: IpcRenderer) {}

  async run(autoIncrementalId: number, source: string): Promise<void> {
    await this.ipc.invoke(
      'THUMBNAILS:CREATE_AND_UPDATE',
      autoIncrementalId,
      source
    );
  }
}
