import { FileCreator } from '../../../../../context/drive/files/application/FileCreator';
import { FileDeleter } from '../../../../../context/drive/files/application/FileDeleter';
import { FilePathUpdater } from '../../../../../context/drive/files/application/FilePathUpdater';
import { FilesPlaceholderUpdater } from '../../../../../context/drive/files/application/FilesPlaceholderUpdater';
import { RepositoryPopulator } from '../../../../../context/drive/files/application/RepositoryPopulator';
import { RetrieveAllFiles } from '../../../../../context/drive/files/application/RetrieveAllFiles';
import { SameFileWasMoved } from '../../../../../context/drive/files/application/SameFileWasMoved';
import { FileFinderByContentsId } from '../../../../../context/drive/files/application/finders/FileFinderByContentsId';
import { FileFinderByPlaceholderId } from '../../../../../context/drive/files/application/finders/FileFinderByPlaceholderId';
import { InMemoryFileRepository } from '../../../../../context/drive/files/infrastructure/InMemoryFileRepository';
import { SDKRemoteFileSystem } from '../../../../../context/drive/files/infrastructure/SDKRemoteFileSystem';
import { LocalFileIdProvider } from '../../../../../context/drive/shared/application/LocalFileIdProvider';
import crypt from '../../../../../context/shared/infrastructure/crypt';
import { NodeWinLocalFileSystem } from '../../../../../context/virtual-drive/files/infrastructure/NodeWinLocalFileSystem';
import { ipcRendererSyncEngine } from '../../../ipcRendererSyncEngine';
import { SharedContainer } from '../../shared/SharedContainer';
import { DependencyInjectionVirtualDrive } from '../../virtual-drive/common/virtualDrive';
import { DependencyInjectionEventBus } from '../common/eventBus';
import { DependencyInjectionEventRepository } from '../common/eventRepository';
import { DependencyInjectionStorageSdk } from '../common/sdk';
import { DependencyInjectionUserProvider } from '../common/user';
import { FoldersContainer } from '../folders/FoldersContainer';
import { FilesContainer } from './FilesContainer';

export async function buildFilesContainer(
  folderContainer: FoldersContainer,
  sharedContainer: SharedContainer
): Promise<{
  container: FilesContainer;
  subscribers: any;
}> {
  const user = DependencyInjectionUserProvider.get();
  const { bus: eventBus } = DependencyInjectionEventBus;
  const eventHistory = DependencyInjectionEventRepository.get();
  const { virtualDrive } = DependencyInjectionVirtualDrive;
  const sdk = await DependencyInjectionStorageSdk.get();

  const remoteFileSystem = new SDKRemoteFileSystem(sdk, crypt, user.bucket);
  const localFileSystem = new NodeWinLocalFileSystem(
    virtualDrive,
    sharedContainer.relativePathToAbsoluteConverter
  );

  const repository = new InMemoryFileRepository();

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
    localFileSystem,
    eventHistory
  );

  const filePathUpdater = new FilePathUpdater(
    remoteFileSystem,
    localFileSystem,
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

  const repositoryPopulator = new RepositoryPopulator(repository);

  const localFileIdProvider = new LocalFileIdProvider(
    sharedContainer.relativePathToAbsoluteConverter
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
    repositoryPopulator: repositoryPopulator,
    filesPlaceholderUpdater,
    fileFinderByPlaceholderId,
  };

  return { container, subscribers: [] };
}
