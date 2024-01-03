import { VirtualDriveDependencyContainer } from '../dependency-injection/virtual-drive/VirtualDriveDependencyContainer';
import Logger from 'electron-log';
import { FuseCallback } from './FuseCallback';
import { IOError, NoSuchFileOrDirectoryError } from './FuseErrors';

export class OpenCallback extends FuseCallback<number> {
  constructor(private readonly container: VirtualDriveDependencyContainer) {
    super('Open');
  }

  async execute(path: string, _flags: Array<any>) {
    const file = await this.container.filesSearcher.run({ path });

    if (!file) {
      return this.left(
        new NoSuchFileOrDirectoryError(
          `${path} not founded on when trying to open it`
        )
      );
    }

    const alreadyDownloaded = await this.container.localContentChecker.run(
      file
    );

    if (alreadyDownloaded) {
      Logger.debug('[FUSE] File contents already in local');
      return this.right(file.id);
    }

    try {
      Logger.debug('[FUSE] File contents not in local');
      await this.container.downloadContentsToPlainFile.run(file);

      return this.right(file.id);
    } catch (err: unknown) {
      Logger.error('[FUSE] Error downloading file: ', err);

      if (err instanceof Error) {
        return this.left(new IOError(`${err.message} when opening ${path}`));
      }

      return this.left(
        new IOError(`unknown error when opening ${path}: ${err}`)
      );
    }
  }
}