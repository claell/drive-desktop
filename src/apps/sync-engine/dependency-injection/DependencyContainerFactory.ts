import { File } from '../../../context/drive/files/domain/File';
import { DomainEventSubscribers } from '../../../context/shared/infrastructure/DomainEventSubscribers';
import { getUser } from '../../main/auth/service';
import { SyncEngineDependencyContainer } from './SyncEngineDependencyContainer';
import { DriveDependencyContainer } from './drive/DriveDependencyContainer';
import { buildBoundaryBridgeContainer } from './drive/boundaryBridge/build';
import { DependencyInjectionEventBus } from './drive/common/eventBus';
import { buildContentsContainer } from './drive/contents/builder';
import { buildFilesContainer } from './drive/files/builder';
import { buildFoldersContainer } from './drive/folders/builder';
import { buildItemsContainer } from './drive/items/builder';
import { LocalDriveDependencyContainer } from './local-drive/LocalDriveDependencyContainer';
import { buildLocalDriveContentsContainer } from './local-drive/contents/build';
import { buildSharedContainer } from './shared/builder';
import { VirtualDriveDependencyContainer } from './virtual-drive/VirtualDriveDependencyContainer';
import { DependencyInjectionVirtualDrive } from './virtual-drive/common/virtualDrive';
import { buildVirtualFileContainer } from './virtual-drive/files/builder';

export class DependencyContainerFactory {
  private static _container: SyncEngineDependencyContainer | undefined;

  async build(): Promise<SyncEngineDependencyContainer> {
    if (DependencyContainerFactory._container !== undefined) {
      return DependencyContainerFactory._container;
    }
    const user = getUser();

    if (!user) {
      throw new Error('');
    }

    const { bus } = DependencyInjectionEventBus;

    const sharedContainer = buildSharedContainer();

    // Local drive container
    const localContents = await buildLocalDriveContentsContainer(
      sharedContainer
    );

    const localDriveContainer: LocalDriveDependencyContainer = {
      dependencies: {
        ...localContents,
      },

      subscribers: () => [],
    };

    // Drive container
    const itemsContainer = buildItemsContainer();

    const tree = await itemsContainer.allStatusesTreeBuilder.run();

    const contentsContainer = await buildContentsContainer();
    const foldersContainer = await buildFoldersContainer(sharedContainer);
    const { container: filesContainer } = await buildFilesContainer(
      tree.files.map((attributes) => File.from(attributes)),
      foldersContainer,
      sharedContainer
    );
    const boundaryBridgeContainer = buildBoundaryBridgeContainer(
      localContents,
      contentsContainer,
      filesContainer
    );

    const driveContainer: DriveDependencyContainer = {
      dependencies: {
        ...itemsContainer,
        ...contentsContainer,
        ...filesContainer,
        ...foldersContainer,
        ...boundaryBridgeContainer,
        ...sharedContainer,
      },

      subscribers: () => ['synchronizeOfflineModificationsOnFolderCreated'],
    };

    // Virtual drive
    const virtualFilesContainer = await buildVirtualFileContainer(
      sharedContainer,
      filesContainer
    );

    const virtualDriveContainer: VirtualDriveDependencyContainer = {
      dependencies: {
        ...virtualFilesContainer,
      },

      subscribers: () => [
        'createFilePlaceholderOnDeletionFailed',
        'createFilePlaceholderOnFileAdded',
        'deleteFilePlaceholderOnFileTrashed',
        'updateFilePlaceholderOnFileUpdated',
      ],
    };

    const { virtualDrive } = DependencyInjectionVirtualDrive;

    const container: SyncEngineDependencyContainer = {
      drive: driveContainer,
      placeholders: virtualDriveContainer,
      localDrive: localDriveContainer,

      shared: sharedContainer,

      virtualDrive: virtualDrive,
    };

    bus.addSubscribers(DomainEventSubscribers.from(driveContainer));
    bus.addSubscribers(DomainEventSubscribers.from(virtualDriveContainer));

    DependencyContainerFactory._container = container;

    return container;
  }
}
