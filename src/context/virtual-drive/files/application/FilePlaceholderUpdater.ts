import { VirtualFile } from '../domain/VirtualFile';
import { VirtualFileSystem } from '../domain/VirtualFileSystem';
import { VirtualFileFinder } from './VirtualFileFinder';

export class FilePlaceholderUpdater {
  constructor(
    private readonly virtualFileFinder: VirtualFileFinder,
    private readonly fs: VirtualFileSystem
  ) {}

  async run(
    contentsId: VirtualFile['contentsId'],
    previousPath: VirtualFile['path']
  ) {
    const file = await this.virtualFileFinder.run(contentsId);

    const exits = await this.fs.exists(file);

    if (exits) {
      return;
    }

    await this.fs.rename(previousPath, file.path);
  }
}
