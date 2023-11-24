import { LocalContents } from '../domain/LocalContents';
import { LocalFileSystem } from '../domain/LocalFileSystem';

export class LocalContentsWriter {
  constructor(private readonly fileSystem: LocalFileSystem) {}

  async run(contents: LocalContents): Promise<void> {
    this.fileSystem.write(contents);
  }
}
