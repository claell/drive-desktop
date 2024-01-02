import { VirtualDriveDependencyContainer } from '../dependency-injection/virtual-drive/VirtualDriveDependencyContainer';
import { Callback } from './Callback';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fuse = require('@gcas/fuse');

export class TrashFile {
  constructor(private readonly container: VirtualDriveDependencyContainer) {}

  async execute(path: string, cb: Callback): Promise<void> {
    try {
      const file = await this.container.filesSearcher.run({ path });

      if (!file) {
        cb(fuse.ENOENT);
        return;
      }

      await this.container.fileDeleter.run(file.contentsId);

      cb(0);
    } catch {
      cb(fuse.EIO);
      return;
    }
  }
}