import { PlatformPathConverter } from '../../../virtual-drive/shared/application/PlatformPathConverter';
import { RelativePathToAbsoluteConverter } from '../../../virtual-drive/shared/application/RelativePathToAbsoluteConverter';
import { LocalFileSystem } from '../domain/LocalFileSystem';
import { LocalContents } from '../domain/LocalContents';

export class LocalContentsReader {
  constructor(
    private readonly fileSystem: LocalFileSystem,
    private readonly relativePathToAbsoluteConverter: RelativePathToAbsoluteConverter
  ) {}

  async run(
    posixRelativePath: string
  ): Promise<{ contents: LocalContents; abortSignal: AbortSignal }> {
    const win32RelativePath =
      PlatformPathConverter.posixToWin(posixRelativePath);

    const absolutePath =
      this.relativePathToAbsoluteConverter.run(win32RelativePath);

    const { contents, abortSignal } = await this.fileSystem.contents(
      absolutePath
    );

    return { contents, abortSignal };
  }
}
