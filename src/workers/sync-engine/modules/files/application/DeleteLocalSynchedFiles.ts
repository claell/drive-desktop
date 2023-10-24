import { FileManagementSystem } from '../domain/FileManagementSystem';
import { FileRepository } from '../domain/FileRepository';

export class DeleteLocalSynchedFiles {
  constructor(
    private readonly repository: FileRepository,
    private readonly fileManagementSystem: FileManagementSystem
  ) {}

  async run(): Promise<void> {
    const files = await this.repository.all();

    const promises = files.map((file) => {
      this.fileManagementSystem.delete(file);
    });

    await Promise.all(promises);
  }
}
