import { BulkFilesPlaceholderCreator } from '../../../../../context/virtual-drive/files/application/BulkFilesPlaceholderCreator';
import { FilePlaceholderCreatorFromContentsId } from '../../../../../context/virtual-drive/files/application/FilePlaceholderCreatorFromContentsId';
import { FilePlaceholderDeleter } from '../../../../../context/virtual-drive/files/application/FilePlaceholderDeleter';
import { FilePlaceholderUpdater } from '../../../../../context/virtual-drive/files/application/FilePlaceholderUpdater';
import { VirtualFileFinder } from '../../../../../context/virtual-drive/files/application/VirtualFileFinder';
import { CreateFilePlaceholderOnDeletionFailed } from '../../../../../context/virtual-drive/files/application/event-subscribers/CreateFilePlaceholderOnDeletionFailed';
import { CreateFilePlaceholderOnFileAdded } from '../../../../../context/virtual-drive/files/application/event-subscribers/CreateFilePlaceholderOnFileAdded';
import { DeleteFilePlaceholderOnFileTrashed } from '../../../../../context/virtual-drive/files/application/event-subscribers/DeleteFilePlaceholderOnFileTrashed';
import { UpdateFilePlaceholderOnFileUpdated } from '../../../../../context/virtual-drive/files/application/event-subscribers/UpdateFilePlaceholderOnFileUpdated';
import { NodeWinLocalFileSystem } from '../../../../../context/virtual-drive/files/infrastructure/NodeWinLocalFileSystem';
import { FilesContainer } from '../../drive/files/FilesContainer';
import { SharedContainer } from '../../shared/SharedContainer';
import { DependencyInjectionVirtualDrive } from '../common/virtualDrive';
import { VirtualFilesContainer } from './VirtualFilesContainer';

export async function buildVirtualFileContainer(
  sharedContainer: SharedContainer,
  filesContainer: FilesContainer
): Promise<VirtualFilesContainer> {
  const virtualDrive = DependencyInjectionVirtualDrive.virtualDrive;

  const virtualFileSystem = new NodeWinLocalFileSystem(
    virtualDrive,
    sharedContainer.relativePathToAbsoluteConverter
  );

  const bulkFilesPlaceholderCreator = new BulkFilesPlaceholderCreator(
    virtualFileSystem
  );

  const virtualFileFinder = new VirtualFileFinder(
    filesContainer.fileFinderByContentsId
  );

  const filePlaceholderCreatorFromContentsId =
    new FilePlaceholderCreatorFromContentsId(
      virtualFileFinder,
      virtualFileSystem
    );

  const filePlaceholderDeleter = new FilePlaceholderDeleter(
    virtualFileFinder,
    virtualFileSystem
  );

  const filePlaceholderUpdater = new FilePlaceholderUpdater(
    virtualFileFinder,
    virtualFileSystem
  );

  const container: VirtualFilesContainer = {
    bulkFilesPlaceholderCreator,
    filePlaceholderCreatorFromContentsId: filePlaceholderCreatorFromContentsId,
    filePlaceholderDeleter: filePlaceholderDeleter,
    filePlaceholderUpdater: filePlaceholderUpdater,

    // Subscribers
    createFilePlaceholderOnDeletionFailed:
      new CreateFilePlaceholderOnDeletionFailed(
        filePlaceholderCreatorFromContentsId
      ),
    createFilePlaceholderOnFileAdded: new CreateFilePlaceholderOnFileAdded(
      filePlaceholderCreatorFromContentsId
    ),
    deleteFilePlaceholderOnFileTrashed: new DeleteFilePlaceholderOnFileTrashed(
      filePlaceholderDeleter
    ),
    updateFilePlaceholderOnFileUpdated: new UpdateFilePlaceholderOnFileUpdated(
      filePlaceholderUpdater
    ),
  };

  return container;
}
