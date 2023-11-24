import { DependencyInjectionHttpClientsProvider } from '../common/clients';
import { DependencyInjectionEventBus } from '../common/eventBus';
import { DependencyInjectionEventRepository } from '../common/eventRepository';
import { DependencyInjectionVirtualDrive } from '../../virtual-drive/common/virtualDrive';
import { FoldersContainer } from './FoldersContainer';
import { AllParentFoldersStatusIsExists } from '../../../../../context/drive/folders/application/AllParentFoldersStatusIsExists';
import { FolderByPartialSearcher } from '../../../../../context/drive/folders/application/FolderByPartialSearcher';
import { FolderCreator } from '../../../../../context/drive/folders/application/FolderCreator';
import { FolderDeleter } from '../../../../../context/drive/folders/application/FolderDeleter';
import { FolderFinder } from '../../../../../context/drive/folders/application/FolderFinder';
import { FolderMover } from '../../../../../context/drive/folders/application/FolderMover';
import { FolderPathUpdater } from '../../../../../context/drive/folders/application/FolderPathUpdater';
import { FolderRenamer } from '../../../../../context/drive/folders/application/FolderRenamer';
import { FolderRepositoryInitiator } from '../../../../../context/drive/folders/application/FolderRepositoryInitiator';
import { FoldersPlaceholderCreator } from '../../../../../context/drive/folders/application/FoldersPlaceholderCreator';
import { OfflineFolderCreator } from '../../../../../context/drive/folders/application/Offline/OfflineFolderCreator';
import { OfflineFolderMover } from '../../../../../context/drive/folders/application/Offline/OfflineFolderMover';
import { OfflineFolderPathUpdater } from '../../../../../context/drive/folders/application/Offline/OfflineFolderPathUpdater';
import { OfflineFolderRenamer } from '../../../../../context/drive/folders/application/Offline/OfflineFolderRenamer';
import { RetrieveAllFolders } from '../../../../../context/drive/folders/application/RetrieveAllFolders';
import { SynchronizeOfflineModifications } from '../../../../../context/drive/folders/application/SynchronizeOfflineModifications';
import { SynchronizeOfflineModificationsOnFolderCreated } from '../../../../../context/drive/folders/application/SynchronizeOfflineModificationsOnFolderCreated';
import { FolderPlaceholderUpdater } from '../../../../../context/drive/folders/application/UpdatePlaceholderFolder';
import { HttpRemoteFileSystem } from '../../../../../context/drive/folders/infrastructure/HttpRemoteFileSystem';
import { InMemoryFolderRepository } from '../../../../../context/drive/folders/infrastructure/InMemoryFolderRepository';
import { InMemoryOfflineFolderRepository } from '../../../../../context/drive/folders/infrastructure/InMemoryOfflineFolderRepository';
import { NodeWinLocalFileSystem } from '../../../../../context/drive/folders/infrastructure/NodeWinLocalFileSystem';
import { ipcRendererSyncEngine } from '../../../ipcRendererSyncEngine';
import { SharedContainer } from '../../shared/SharedContainer';

export async function buildFoldersContainer(
  shredContainer: SharedContainer
): Promise<FoldersContainer> {
  const clients = DependencyInjectionHttpClientsProvider.get();
  const eventBus = DependencyInjectionEventBus.bus;
  const { virtualDrive } = DependencyInjectionVirtualDrive;
  const eventRepository = DependencyInjectionEventRepository.get();

  const repository = new InMemoryFolderRepository();

  const localFileSystem = new NodeWinLocalFileSystem(virtualDrive);

  const remoteFileSystem = new HttpRemoteFileSystem(
    clients.drive,
    clients.newDrive
  );

  const folderFinder = new FolderFinder(repository);

  const allParentFoldersStatusIsExists = new AllParentFoldersStatusIsExists(
    repository
  );

  const folderDeleter = new FolderDeleter(
    repository,
    remoteFileSystem,
    localFileSystem,
    allParentFoldersStatusIsExists
  );

  const folderCreator = new FolderCreator(
    repository,
    remoteFileSystem,
    ipcRendererSyncEngine,
    eventBus
  );

  const folderMover = new FolderMover(
    repository,
    remoteFileSystem,
    folderFinder
  );
  const folderRenamer = new FolderRenamer(
    repository,
    remoteFileSystem,
    ipcRendererSyncEngine
  );

  const folderByPartialSearcher = new FolderByPartialSearcher(repository);

  const folderPathUpdater = new FolderPathUpdater(
    repository,
    folderMover,
    folderRenamer
  );

  const offlineRepository = new InMemoryOfflineFolderRepository();
  const offlineFolderCreator = new OfflineFolderCreator(
    folderFinder,
    offlineRepository,
    repository
  );

  const offlineFolderMover = new OfflineFolderMover(
    offlineRepository,
    folderFinder
  );
  const offlineFolderRenamer = new OfflineFolderRenamer(offlineRepository);
  const offlineFolderPathUpdater = new OfflineFolderPathUpdater(
    offlineRepository,
    offlineFolderMover,
    offlineFolderRenamer
  );
  const synchronizeOfflineModifications = new SynchronizeOfflineModifications(
    offlineRepository,
    repository,
    folderRenamer,
    eventRepository
  );

  const synchronizeOfflineModificationsOnFolderCreated =
    new SynchronizeOfflineModificationsOnFolderCreated(
      synchronizeOfflineModifications
    );

  const folderRepositoryInitiator = new FolderRepositoryInitiator(repository);

  const foldersPlaceholderCreator = new FoldersPlaceholderCreator(
    localFileSystem
  );

  const folderPlaceholderUpdater = new FolderPlaceholderUpdater(
    repository,
    localFileSystem,
    shredContainer.relativePathToAbsoluteConverter
  );

  return {
    folderCreator,
    folderFinder,
    folderDeleter,
    allParentFoldersStatusIsExists: allParentFoldersStatusIsExists,
    folderPathUpdater,
    folderByPartialSearcher,
    synchronizeOfflineModificationsOnFolderCreated,
    offline: {
      folderCreator: offlineFolderCreator,
      folderPathUpdater: offlineFolderPathUpdater,
      synchronizeOfflineModifications,
    },
    retrieveAllFolders: new RetrieveAllFolders(repository),
    folderRepositoryInitiator,
    foldersPlaceholderCreator,
    folderPlaceholderUpdater,
  };
}
