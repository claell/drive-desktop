import { BulkFilesPlaceholderCreator } from '../../../../../context/virtual-drive/files/application/BulkFilesPlaceholderCreator';
import { FilePlaceholderCreatorFromContentsId } from '../../../../../context/virtual-drive/files/application/FilePlaceholderCreatorFromContentsId';
import { FilePlaceholderDeleter } from '../../../../../context/virtual-drive/files/application/FilePlaceholderDeleter';
import { FilePlaceholderUpdater } from '../../../../../context/virtual-drive/files/application/FilePlaceholderUpdater';
import { CreateFilePlaceholderOnDeletionFailed } from '../../../../../context/virtual-drive/files/application/event-subscribers/CreateFilePlaceholderOnDeletionFailed';
import { CreateFilePlaceholderOnFileAdded } from '../../../../../context/virtual-drive/files/application/event-subscribers/CreateFilePlaceholderOnFileAdded';
import { DeleteFilePlaceholderOnFileTrashed } from '../../../../../context/virtual-drive/files/application/event-subscribers/DeleteFilePlaceholderOnFileTrashed';
import { UpdateFilePlaceholderOnFileUpdated } from '../../../../../context/virtual-drive/files/application/event-subscribers/UpdateFilePlaceholderOnFileUpdated';

export interface VirtualFilesContainer {
  bulkFilesPlaceholderCreator: BulkFilesPlaceholderCreator;
  filePlaceholderCreatorFromContentsId: FilePlaceholderCreatorFromContentsId;
  filePlaceholderDeleter: FilePlaceholderDeleter;
  filePlaceholderUpdater: FilePlaceholderUpdater;

  //Subscribers
  createFilePlaceholderOnDeletionFailed: CreateFilePlaceholderOnDeletionFailed;
  createFilePlaceholderOnFileAdded: CreateFilePlaceholderOnFileAdded;
  deleteFilePlaceholderOnFileTrashed: DeleteFilePlaceholderOnFileTrashed;
  updateFilePlaceholderOnFileUpdated: UpdateFilePlaceholderOnFileUpdated;
}
