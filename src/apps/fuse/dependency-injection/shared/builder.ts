import path from 'path';
import { SharedContainer } from './SharedContainer';
import { RelativePathToAbsoluteConverter } from '../../../../context/drive/shared/application/RelativePathToAbsoluteConverter';
import { FuseAppDataLocalFileContentsDirectoryProvider } from '../../../../context/drive/shared/infrastructure/LocalFileContentsDirectoryProviders/FuseAppDataLocalFileContentsDirectoryProvider';

export async function buildSharedContainer(): Promise<SharedContainer> {
  const localFileContentsDirectoryProvider =
    new FuseAppDataLocalFileContentsDirectoryProvider();

  const dir = await localFileContentsDirectoryProvider.provide();

  const base = path.join(dir, 'downloaded');

  const relativePathToAbsoluteConverter = new RelativePathToAbsoluteConverter(
    base
  );

  return {
    relativePathToAbsoluteConverter,
  };
}
