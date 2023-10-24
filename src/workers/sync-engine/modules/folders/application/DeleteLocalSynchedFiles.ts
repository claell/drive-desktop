import { FolderManagementSystem } from '../domain/FolderManagementSystem';
import { FolderRepository } from '../domain/FolderRepository';

export class DeleteLocalSynchedFolders {
  constructor(
    private readonly repository: FolderRepository,
    private readonly folderManagementSystem: FolderManagementSystem
  ) {}

  async run(): Promise<void> {
    const folders = await this.repository.all();

    const promises = folders.map((folder) => {
      this.folderManagementSystem.delete(folder);
    });

    await Promise.caller(promises);
  }
}
