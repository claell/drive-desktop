import { VirtualFileSystem } from '../domain/VirtualFileSystem';
import { VirtualFile } from '../domain/VirtualFile';
import { VirtualFileFinder } from './VirtualFileFinder';

export class FilePlaceholderCreatorFromContentsId {
  constructor(
    private readonly finder: VirtualFileFinder,
    private readonly virtualFileSystem: VirtualFileSystem
  ) {}

  async run(contentsId: VirtualFile['contentsId']) {
    const file = await this.finder.run(contentsId);

    this.virtualFileSystem.createPlaceHolder(file);
  }
}
