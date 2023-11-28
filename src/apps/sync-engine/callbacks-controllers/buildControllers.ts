import { SyncEngineDependencyContainer } from '../dependency-injection/SyncEngineDependencyContainer';
import { AddController } from './controllers/AddController';
import { DeleteController } from './controllers/DeleteController';
import { DownloadFileController } from './controllers/DownloadFileController';
import { NotifyPlaceholderHydrationFinished } from './controllers/NotifyPlaceholderHydrationFinished';
import { RenameOrMoveController } from './controllers/RenameOrMoveController';
import { OfflineRenameOrMoveController } from './controllers/offline/OfflineRenameOrMoveController';

export function buildControllers(container: SyncEngineDependencyContainer) {
  const addFileController = new AddController(
    container.shared.absolutePathToRelativeConverter,
    container.drive.dependencies.fileCreationOrchestrator,
    container.drive.dependencies.folderCreator,
    container.drive.dependencies.offline.folderCreator
  );

  const deleteController = new DeleteController(
    container.drive.dependencies.fileDeleter,
    container.drive.dependencies.folderDeleter
  );

  const renameOrMoveController = new RenameOrMoveController(
    container.drive.dependencies.absolutePathToRelativeConverter,
    container.drive.dependencies.filePathUpdater,
    container.drive.dependencies.folderPathUpdater,
    deleteController
  );

  const downloadFileController = new DownloadFileController(
    container.drive.dependencies.fileFinderByContentsId,
    container.drive.dependencies.contentsDownloader,
    container.localDrive.dependencies.localContentsWriter
  );

  const offlineRenameOrMoveController = new OfflineRenameOrMoveController(
    container.drive.dependencies.absolutePathToRelativeConverter,
    container.drive.dependencies.offline.folderPathUpdater
  );

  const notifyPlaceholderHydrationFinished =
    new NotifyPlaceholderHydrationFinished(
      container.drive.dependencies.notifyMainProcessHydrationFinished
    );

  return {
    addFile: addFileController,
    renameOrMove: renameOrMoveController,
    delete: deleteController,
    downloadFile: downloadFileController,
    offline: {
      renameOrMove: offlineRenameOrMoveController,
    },
    notifyPlaceholderHydrationFinished,
  } as const;
}
