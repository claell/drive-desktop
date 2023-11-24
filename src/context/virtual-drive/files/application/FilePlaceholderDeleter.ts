import { VirtualFile } from '../domain/VirtualFile';
import { VirtualFileSystem } from '../domain/VirtualFileSystem';
import { VirtualFileFinder } from './VirtualFileFinder';

export class FilePlaceholderDeleter {
  constructor(
    private readonly virtualFileFinder: VirtualFileFinder,
    private readonly fs: VirtualFileSystem
  ) {}

  async run(contentsId: VirtualFile['contentsId']): Promise<void> {
    const file = await this.virtualFileFinder.run(contentsId);

    await this.fs.delete(file.path);
  }
}
