import { PathLike } from 'fs';
import fs from 'fs/promises';
import { RelativePathToAbsoluteConverter } from '../../shared/application/RelativePathToAbsoluteConverter';
import { Folder } from '../domain/Folder';
import { FolderManagementSystem } from '../domain/FolderManagementSystem';
import { PlatformPathConverter } from '../../shared/application/PlatformPathConverter';

export class LocalFolderManagementSystem implements FolderManagementSystem {
  constructor(
    private readonly relativePathToAbsoluteConverter: RelativePathToAbsoluteConverter
  ) {}

  private absolutePathFor(folder: Folder): PathLike {
    const win32RelativePath = PlatformPathConverter.posixToWin(
      folder.path.value
    );

    return this.relativePathToAbsoluteConverter.run(win32RelativePath);
  }

  delete(folder: Folder): Promise<void> {
    const absolutePath = this.absolutePathFor(folder);

    return fs.unlink(absolutePath);
  }
}
