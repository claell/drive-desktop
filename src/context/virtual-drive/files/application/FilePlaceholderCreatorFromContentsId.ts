import { File } from '../domain/File';
import { LocalFileSystem } from '../domain/file-systems/LocalFileSystem';
import { FileFinderByContentsId } from './finders/FileFinderByContentsId';

export class FilePlaceholderCreatorFromContentsId {
  constructor(
    private readonly finder: FileFinderByContentsId,
    private readonly local: LocalFileSystem
  ) {}

  run(contentsId: File['contentsId']) {
    const file = this.finder.run(contentsId);

    this.local.createPlaceHolder(file);
  }
}
