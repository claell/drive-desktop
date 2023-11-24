import { FileCreator } from '../../../../../context/drive/files/application/FileCreator';
import { FileDeleter } from '../../../../../context/drive/files/application/FileDeleter';
import { FilePathUpdater } from '../../../../../context/drive/files/application/FilePathUpdater';
import { FilesPlaceholderUpdater } from '../../../../../context/drive/files/application/FilesPlaceholderUpdater';
import { RepositoryPopulator } from '../../../../../context/drive/files/application/RepositoryPopulator';
import { RetrieveAllFiles } from '../../../../../context/drive/files/application/RetrieveAllFiles';
import { SameFileWasMoved } from '../../../../../context/drive/files/application/SameFileWasMoved';
import { FileFinderByContentsId } from '../../../../../context/drive/files/application/finders/FileFinderByContentsId';
import { FileFinderByPlaceholderId } from '../../../../../context/drive/files/application/finders/FileFinderByPlaceholderId';

export interface FilesContainer {
  fileFinderByContentsId: FileFinderByContentsId;
  fileDeleter: FileDeleter;
  filePathUpdater: FilePathUpdater;
  fileCreator: FileCreator;
  sameFileWasMoved: SameFileWasMoved;
  retrieveAllFiles: RetrieveAllFiles;
  repositoryPopulator: RepositoryPopulator;
  filesPlaceholderUpdater: FilesPlaceholderUpdater;
  fileFinderByPlaceholderId: FileFinderByPlaceholderId;
}
