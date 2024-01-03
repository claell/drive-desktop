import { VirtualDriveDependencyContainer } from '../dependency-injection/virtual-drive/VirtualDriveDependencyContainer';
import { NotifyFuseCallback } from './FuseCallback';
import { IOError, NoSuchFileOrDirectoryError } from './FuseErrors';

export class TrashFileCallback extends NotifyFuseCallback {
  constructor(private readonly container: VirtualDriveDependencyContainer) {
    super('Trash file');
  }

  async execute(path: string) {
    const file = await this.container.filesSearcher.run({ path });

    if (!file) {
      return this.left(
        new NoSuchFileOrDirectoryError(
          `${path} not founded when trying to trash it`
        )
      );
    }

    try {
      await this.container.fileDeleter.run(file.contentsId);

      return this.right();
    } catch {
      return this.left(new IOError(`trying to trash ${path}`));
    }
  }
}