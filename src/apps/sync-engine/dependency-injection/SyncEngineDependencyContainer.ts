import { DriveDependencyContainer } from './drive/DriveDependencyContainer';
import { VirtualDriveDependencyContainer } from './virtual-drive/VirtualDriveDependencyContainer';

import { VirtualDrive } from 'virtual-drive/dist';

export interface SyncEngineDependencyContainer {
  drive: DriveDependencyContainer;
  placeholders: VirtualDriveDependencyContainer;

  virtualDrive: VirtualDrive;
}
