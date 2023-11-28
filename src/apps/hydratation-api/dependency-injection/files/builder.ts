import { FilesByFolderPathSearcher } from '../../../../context/drive/files/application/FilesByFolderPathSearcher';
import { FilesSearcher } from '../../../../context/drive/files/application/FilesSearcher';
import { InMemoryFileRepository } from '../../../../context/drive/files/infrastructure/InMemoryFileRepository';
import { FoldersContainer } from '../folders/FoldersContainer';
import { FilesContainer } from './FilesContainer';
import { File } from '../../../../context/drive/files/domain/File';

export async function buildFilesContainer(
  initialFiles: Array<File>,
  folderContainer: FoldersContainer
): Promise<FilesContainer> {
  const repository = InMemoryFileRepository.fromArray(initialFiles);

  const filesByFolderPathNameLister = new FilesByFolderPathSearcher(
    repository,
    folderContainer.folderFinder
  );

  const filesSearcher = new FilesSearcher(repository);

  return {
    filesByFolderPathNameLister,
    filesSearcher,
  };
}
