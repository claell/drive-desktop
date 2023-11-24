import { FileAttributes } from '../../../drive/files/domain/File';
import { VirtualFileSystem } from '../domain/VirtualFileSystem';
import { VirtualFile } from '../domain/VirtualFile';

export class BulkFilesPlaceholderCreator {
  constructor(private readonly virtualFileSystem: VirtualFileSystem) {}

  async run(filesAttributes: Array<FileAttributes>): Promise<void> {
    const virtualFiles = filesAttributes.map((attributes) => {
      const virtualDriveAttributes = {
        id: attributes.contentsId,
        path: attributes.path,
        size: attributes.size,
        createdAt: new Date(attributes.createdAt).getTime(),
        updatedAt: new Date(attributes.updatedAt).getTime(),
      };

      return VirtualFile.from(virtualDriveAttributes);
    });

    const creationPromises = virtualFiles.map((file) =>
      this.virtualFileSystem.createPlaceHolder(file)
    );

    await Promise.all(creationPromises);
  }
}
