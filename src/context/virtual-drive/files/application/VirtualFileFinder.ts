import { FileFinderByContentsId } from '../../../drive/files/application/finders/FileFinderByContentsId';
import { VirtualFile } from '../domain/VirtualFile';

export class VirtualFileFinder {
  constructor(private readonly driveFileFinder: FileFinderByContentsId) {}

  async run(contentsId: string): Promise<VirtualFile> {
    const file = this.driveFileFinder.run(contentsId);

    return VirtualFile.from({
      id: file.contentsId,
      path: file.path,
      size: file.size,
      createdAt: file.createdAt.getTime(),
      updatedAt: file.updatedAt.getTime(),
    });
  }
}
