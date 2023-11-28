import { BoundaryBridgeContainer } from './BoundaryBridgeContainer';
import { ContentsContainer } from '../contents/ContentsContainer';
import { FilesContainer } from '../files/FilesContainer';
import { FileCreationOrchestrator } from '../../../../../context/drive/boundaryBridge/application/FileCreationOrchestrator';
import { LocalDriveContentsContainer } from '../../local-drive/contents/LocalDriveContentsContainer';

export function buildBoundaryBridgeContainer(
  localDriveContentsContainer: LocalDriveContentsContainer,
  contentsContainer: ContentsContainer,
  filesContainer: FilesContainer
): BoundaryBridgeContainer {
  const fileCreationOrchestrator = new FileCreationOrchestrator(
    contentsContainer.contentsUploader,
    filesContainer.fileCreator,
    localDriveContentsContainer.localContentsReader,
    filesContainer.sameFileWasMoved
  );

  return {
    fileCreationOrchestrator,
  };
}
