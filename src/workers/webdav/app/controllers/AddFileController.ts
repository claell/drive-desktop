import Logger from 'electron-log';
import { ContentsUploader } from '../../modules/contents/application/ContentsUploader';
import { FileCreator } from '../../modules/files/application/FileCreator';
import { FilePathFromAbsolutePathCreator } from '../../modules/files/application/FilePathFromAbsolutePathCreator';
import { ThumbnailCreator } from '../../modules/thumbnails/application/ThumbnailCreator';

export type DehydratateAndCreatePlaceholder = (
  id: string,
  relativePath: string,
  size: number
) => void;

export class AddFileController {
  constructor(
    private readonly contentsUploader: ContentsUploader,
    private readonly filePathFromAbsolutePathCreator: FilePathFromAbsolutePathCreator,
    private readonly fileCreator: FileCreator,
    private readonly thumbnailsCreator: ThumbnailCreator
  ) {}

  private async runAsync(
    absolutePath: string,
    done: DehydratateAndCreatePlaceholder
  ) {
    const fileContents = await this.contentsUploader.run(absolutePath);

    const path = this.filePathFromAbsolutePathCreator.run(absolutePath);

    const { file, autoincrementailId } = await this.fileCreator.run(
      path,
      fileContents
    );

    void (await this.thumbnailsCreator.run(autoincrementailId, absolutePath));

    done(file.contentsId, file.path.value, file.size);
  }

  execute(
    absolutePath: string,
    dehydratateAndCreatePlaceholder: DehydratateAndCreatePlaceholder
  ) {
    this.runAsync(absolutePath, dehydratateAndCreatePlaceholder)
      .then(() => Logger.info('File added successfull'))
      .catch((err) => Logger.error('Error when adding a file: ', err));
  }
}
