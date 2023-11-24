import { DependencyContainer } from '../../../shared/DependencyContainer';
import { SharedContainer } from '../shared/SharedContainer';
import { BoundaryBridgeContainer } from './boundaryBridge/BoundaryBridgeContainer';
import { ContentsContainer } from './contents/ContentsContainer';
import { FilesContainer } from './files/FilesContainer';
import { FoldersContainer } from './folders/FoldersContainer';
import { ItemsContainer } from './items/ItemsContainer';

interface Dependencies
  extends ItemsContainer,
    ContentsContainer,
    FilesContainer,
    FoldersContainer,
    BoundaryBridgeContainer,
    SharedContainer {}

export type DriveDependencyContainer = DependencyContainer<Dependencies>;
