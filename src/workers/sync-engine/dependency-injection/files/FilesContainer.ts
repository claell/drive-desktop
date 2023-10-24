import { ManagedFileRepository } from 'workers/sync-engine/modules/files/domain/ManagedFileRepository';
import { CreateFilePlaceholderOnDeletionFailed } from '../../modules/files/application/CreateFilePlaceholderOnDeletionFailed';
import { FileByPartialSearcher } from '../../modules/files/application/FileByPartialSearcher';
import { FileClearer } from '../../modules/files/application/FileClearer';
import { FileCreator } from '../../modules/files/application/FileCreator';
import { FileDeleter } from '../../modules/files/application/FileDeleter';
import { FileFinderByContentsId } from '../../modules/files/application/FileFinderByContentsId';
import { FilePathUpdater } from '../../modules/files/application/FilePathUpdater';
import { FilePlaceholderCreatorFromContentsId } from '../../modules/files/application/FilePlaceholderCreatorFromContentsId';
import { LocalRepositoryRepositoryRefresher } from '../../modules/files/application/LocalRepositoryRepositoryRefresher';
import { SameFileWasMoved } from '../../modules/files/application/SameFileWasMoved';
import { DeleteLocalSynchedFiles } from '../../modules/files/application/DeleteLocalSynchedFiles';

export interface FilesContainer {
  fileFinderByContentsId: FileFinderByContentsId;
  localRepositoryRefresher: LocalRepositoryRepositoryRefresher;
  fileDeleter: FileDeleter;
  fileByPartialSearcher: FileByPartialSearcher;
  filePathUpdater: FilePathUpdater;
  fileCreator: FileCreator;
  filePlaceholderCreatorFromContentsId: FilePlaceholderCreatorFromContentsId;
  createFilePlaceholderOnDeletionFailed: CreateFilePlaceholderOnDeletionFailed;
  fileClearer: FileClearer;
  managedFileRepository: ManagedFileRepository;
  sameFileWasMoved: SameFileWasMoved;
  deleteLocalSynchedFiles: DeleteLocalSynchedFiles;
}
