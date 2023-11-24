import { AllParentFoldersStatusIsExists } from '../../../../../context/drive/folders/application/AllParentFoldersStatusIsExists';
import { FolderByPartialSearcher } from '../../../../../context/drive/folders/application/FolderByPartialSearcher';
import { FolderCreator } from '../../../../../context/drive/folders/application/FolderCreator';
import { FolderDeleter } from '../../../../../context/drive/folders/application/FolderDeleter';
import { FolderFinder } from '../../../../../context/drive/folders/application/FolderFinder';
import { FolderPathUpdater } from '../../../../../context/drive/folders/application/FolderPathUpdater';
import { FolderRepositoryInitiator } from '../../../../../context/drive/folders/application/FolderRepositoryInitiator';
import { FoldersPlaceholderCreator } from '../../../../../context/drive/folders/application/FoldersPlaceholderCreator';
import { OfflineFolderCreator } from '../../../../../context/drive/folders/application/Offline/OfflineFolderCreator';
import { OfflineFolderPathUpdater } from '../../../../../context/drive/folders/application/Offline/OfflineFolderPathUpdater';
import { RetrieveAllFolders } from '../../../../../context/drive/folders/application/RetrieveAllFolders';
import { SynchronizeOfflineModifications } from '../../../../../context/drive/folders/application/SynchronizeOfflineModifications';
import { SynchronizeOfflineModificationsOnFolderCreated } from '../../../../../context/drive/folders/application/SynchronizeOfflineModificationsOnFolderCreated';
import { FolderPlaceholderUpdater } from '../../../../../context/drive/folders/application/UpdatePlaceholderFolder';

export interface FoldersContainer {
  folderCreator: FolderCreator;
  folderFinder: FolderFinder;
  folderDeleter: FolderDeleter;
  allParentFoldersStatusIsExists: AllParentFoldersStatusIsExists;
  folderPathUpdater: FolderPathUpdater;
  folderByPartialSearcher: FolderByPartialSearcher;
  synchronizeOfflineModificationsOnFolderCreated: SynchronizeOfflineModificationsOnFolderCreated;
  offline: {
    folderCreator: OfflineFolderCreator;
    folderPathUpdater: OfflineFolderPathUpdater;
    synchronizeOfflineModifications: SynchronizeOfflineModifications;
  };
  retrieveAllFolders: RetrieveAllFolders;
  folderRepositoryInitiator: FolderRepositoryInitiator;
  folderPlaceholderUpdater: FolderPlaceholderUpdater;
  foldersPlaceholderCreator: FoldersPlaceholderCreator;
}
