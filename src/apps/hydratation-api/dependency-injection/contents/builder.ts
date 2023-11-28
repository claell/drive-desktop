import { Environment } from '@internxt/inxt-js';
import { DownloadContentsToPlainFile } from '../../../../context/drive/contents/application/download/DownloadContentsToPlainFile';
import { EnvironmentRemoteFileContentsManagersFactory } from '../../../../context/drive/contents/infrastructure/EnvironmentRemoteFileContentsManagersFactory';
import { FuseAppDataLocalFileContentsDirectoryProvider } from '../../../../context/drive/shared/infrastructure/LocalFileContentsDirectoryProviders/FuseAppDataLocalFileContentsDirectoryProvider';
import { LocalContentsDeleter } from '../../../../context/local-drive/contents/application/LocalContentsDeleter';
import { FSLocalFileSystem } from '../../../../context/local-drive/contents/infrastructure/FSLocalFileSystem';
import { DependencyInjectionEventBus } from '../common/eventBus';
import { DependencyInjectionMnemonicProvider } from '../common/mnemonic';
import { DependencyInjectionUserProvider } from '../common/user';
import { ContentsContainer } from './ContentsContainer';

export async function buildContentsContainer(): Promise<ContentsContainer> {
  const user = DependencyInjectionUserProvider.get();
  const mnemonic = DependencyInjectionMnemonicProvider.get();
  const { bus: eventBus } = DependencyInjectionEventBus;

  const environment = new Environment({
    bridgeUrl: process.env.BRIDGE_URL,
    bridgeUser: user.bridgeUser,
    bridgePass: user.userId,
    encryptionKey: mnemonic,
  });

  const contentsManagerFactory =
    new EnvironmentRemoteFileContentsManagersFactory(environment, user.bucket);

  const localFileContentsDirectoryProvider =
    new FuseAppDataLocalFileContentsDirectoryProvider();

  const localFS = new FSLocalFileSystem(
    localFileContentsDirectoryProvider,
    'downloaded'
  );

  const downloadContentsToPlainFile = new DownloadContentsToPlainFile(
    contentsManagerFactory,
    localFS,
    eventBus
  );

  const localContentsDeleter = new LocalContentsDeleter(localFS);

  return {
    downloadContentsToPlainFile,
    localContentsDeleter,
  };
}
