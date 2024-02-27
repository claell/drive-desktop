import { VirtualDriveDependencyContainer } from '../dependency-injection/virtual-drive/VirtualDriveDependencyContainer';
import Logger from 'electron-log';
import { FuseCallback } from './FuseCallback';
import { FuseIOError, FuseNoSuchFileOrDirectoryError } from './FuseErrors';

export class OpenCallback extends FuseCallback<number> {
  constructor(private readonly container: VirtualDriveDependencyContainer) {
    super('Open');
  }

  async execute(path: string, _flags: Array<any>) {
    const file = await this.container.filesSearcher.run({ path });

    if (!file) {
      return this.left(new FuseNoSuchFileOrDirectoryError());
    }

    try {
      await this.container.downloadContentsToPlainFile.run(file);

      return this.right(file.id);
    } catch (err: unknown) {
      Logger.error('Error downloading file: ', err);
      if (err instanceof Error) {
        return this.left(new FuseIOError());
      }
      return this.left(new FuseIOError());
    }
  }
}