import { DependencyContainer } from '../../../shared/DependencyContainer';
import { LocalDriveContentsContainer } from './contents/LocalDriveContentsContainer';

interface Dependencies extends LocalDriveContentsContainer {}

export interface LocalDriveDependencyContainer
  extends DependencyContainer<Dependencies> {}
