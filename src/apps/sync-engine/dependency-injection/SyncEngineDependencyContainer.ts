import { DriveDependencyContainer } from './drive/DriveDependencyContainer';
import { LocalDriveDependencyContainer } from './local-drive/LocalDriveDependencyContainer';
import { SharedContainer } from './shared/SharedContainer';
import { VirtualDriveDependencyContainer } from './virtual-drive/VirtualDriveDependencyContainer';

import { VirtualDrive } from 'virtual-drive/dist';

export interface SyncEngineDependencyContainer {
  drive: DriveDependencyContainer;
  placeholders: VirtualDriveDependencyContainer;
  localDrive: LocalDriveDependencyContainer;

  shared: SharedContainer;

  virtualDrive: VirtualDrive;
}
