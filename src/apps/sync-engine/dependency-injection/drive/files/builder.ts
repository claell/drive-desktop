import { FileCreator } from '../../../../../context/drive/files/application/FileCreator';
import { FileDeleter } from '../../../../../context/drive/files/application/FileDeleter';
import { FilePathUpdater } from '../../../../../context/drive/files/application/FilePathUpdater';
import { FilesPlaceholderUpdater } from '../../../../../context/drive/files/application/FilesPlaceholderUpdater';
import { RetrieveAllFiles } from '../../../../../context/drive/files/application/RetrieveAllFiles';
import { SameFileWasMoved } from '../../../../../context/drive/files/application/SameFileWasMoved';
import { FileFinderByContentsId } from '../../../../../context/drive/files/application/finders/FileFinderByContentsId';
import { FileFinderByPlaceholderId } from '../../../../../context/drive/files/application/finders/FileFinderByPlaceholderId';
import { File } from '../../../../../context/drive/files/domain/File';
import { InMemoryFileRepository } from '../../../../../context/drive/files/infrastructure/InMemoryFileRepository';
import { SDKRemoteFileSystem } from '../../../../../context/drive/files/infrastructure/SDKRemoteFileSystem';
import { LocalFileIdProvider } from '../../../../../context/drive/shared/application/LocalFileIdProvider';
import crypt from '../../../../../context/shared/infrastructure/crypt';
import { ipcRendererSyncEngine } from '../../../ipcRendererSyncEngine';
import { SharedContainer } from '../../shared/SharedContainer';
import { DependencyInjectionEventBus } from '../common/eventBus';
import { DependencyInjectionEventRepository } from '../common/eventRepository';
import { DependencyInjectionStorageSdk } from '../common/sdk';
import { DependencyInjectionUserProvider } from '../common/user';
import { FoldersContainer } from '../folders/FoldersContainer';
import { FilesContainer } from './FilesContainer';

export async function buildFilesContainer(
  initFiles: Array<File>,
  folderContainer: FoldersContainer,
  sharedContainer: SharedContainer
): Promise<{
  container: FilesContainer;
  subscribers: any;
}> {
  const user = DependencyInjectionUserProvider.get();
  const { bus: eventBus } = DependencyInjectionEventBus;
  const eventHistory = DependencyInjectionEventRepository.get();
  const sdk = await DependencyInjectionStorageSdk.get();

  const remoteFileSystem = new SDKRemoteFileSystem(sdk, crypt, user.bucket);

  const repository = InMemoryFileRepository.fromArray(initFiles);

  const localFileIdProvider = new LocalFileIdProvider(
    sharedContainer.relativePathToAbsoluteConverter
  );

  const fileFinderByContentsId = new FileFinderByContentsId(repository);

  const fileDeleter = new FileDeleter(
    remoteFileSystem,
    repository,
    folderContainer.allParentFoldersStatusIsExists,
    ipcRendererSyncEngine,
    eventBus
  );

  const sameFileWasMoved = new SameFileWasMoved(
    repository,
    localFileIdProvider,
    eventHistory
  );

  const filePathUpdater = new FilePathUpdater(
    remoteFileSystem,
    localFileIdProvider,
    repository,
    fileFinderByContentsId,
    folderContainer.folderFinder,
    ipcRendererSyncEngine,
    eventBus
  );

  const fileCreator = new FileCreator(
    remoteFileSystem,
    repository,
    folderContainer.folderFinder,
    fileDeleter,
    eventBus,
    ipcRendererSyncEngine
  );

  const filesPlaceholderUpdater = new FilesPlaceholderUpdater(
    repository,
    localFileIdProvider,
    eventBus
  );

  const fileFinderByPlaceholderId = new FileFinderByPlaceholderId(repository);

  const container: FilesContainer = {
    fileFinderByContentsId,
    fileDeleter,
    filePathUpdater,
    fileCreator,
    sameFileWasMoved,
    retrieveAllFiles: new RetrieveAllFiles(repository),
    filesPlaceholderUpdater,
    fileFinderByPlaceholderId,
  };

  return { container, subscribers: [] };
}
