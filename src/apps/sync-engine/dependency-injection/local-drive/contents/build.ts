import { IPCLocalFileContentsDirectoryProvider } from '../../../../../context/drive/shared/infrastructure/LocalFileContentsDirectoryProviders/IPCLocalFileContentsDirectoryProvider';
import { LocalContentsReader } from '../../../../../context/local-drive/contents/application/LocalContentsReader';
import { LocalContentsWriter } from '../../../../../context/local-drive/contents/application/LocalContentsWriter';
import { FSLocalFileSystem } from '../../../../../context/local-drive/contents/infrastructure/FSLocalFileSystem';
import { SharedContainer } from '../../shared/SharedContainer';
import { LocalDriveContentsContainer } from './LocalDriveContentsContainer';

export async function buildLocalDriveContentsContainer(
  sharedContainer: SharedContainer
): Promise<LocalDriveContentsContainer> {
  const provider = new IPCLocalFileContentsDirectoryProvider();
  const localContentsFileSystem = new FSLocalFileSystem(provider, '');

  const localContentsReader = new LocalContentsReader(
    localContentsFileSystem,
    sharedContainer.relativePathToAbsoluteConverter
  );

  const localContentsWriter = new LocalContentsWriter(localContentsFileSystem);

  return {
    localContentsReader,
    localContentsWriter,
  };
}
