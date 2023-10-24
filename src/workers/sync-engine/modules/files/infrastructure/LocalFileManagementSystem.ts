import { PathLike } from 'fs';
import fs from 'fs/promises';
import { PlatformPathConverter } from '../../shared/application/PlatformPathConverter';
import { RelativePathToAbsoluteConverter } from '../../shared/application/RelativePathToAbsoluteConverter';
import { File } from '../domain/File';
import { FileManagementSystem } from '../domain/FileManagementSystem';

export class LocalFileManagementSystem implements FileManagementSystem {
  constructor(
    private readonly relativePathToAbsoluteConverter: RelativePathToAbsoluteConverter
  ) {}

  private absolutePathFor(file: File): PathLike {
    const win32RelativePath = PlatformPathConverter.posixToWin(file.path.value);

    return this.relativePathToAbsoluteConverter.run(win32RelativePath);
  }

  async delete(file: File): Promise<void> {
    const absolutePath = this.absolutePathFor(file);

    await fs.unlink(absolutePath);
  }
}
