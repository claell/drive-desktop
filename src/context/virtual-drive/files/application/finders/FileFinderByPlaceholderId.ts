import { File } from '../../domain/File';
import { FileRepository } from '../../domain/FileRepository';
import { FilePlaceholderId } from '../../domain/PlaceholderId';
import { FileNotFoundError } from '../../domain/errors/FileNotFoundError';

export class FileFinderByPlaceholderId {
  constructor(private readonly repository: FileRepository) {}

  run(placeholderId: FilePlaceholderId): Promise<File> {
    const sanitized = placeholderId
      .replace(
        // eslint-disable-next-line no-control-regex
        /[\x00-\x1F\x7F-\x9F]/g,
        ''
      )
      .normalize();

    const [_, contentsId] = sanitized.split(':');

    const file = this.repository.searchByPartial({ contentsId });

    if (!file) {
      throw new FileNotFoundError(contentsId);
    }

    return Promise.resolve(file);
  }
}
