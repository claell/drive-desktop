import { Environment } from '@internxt/inxt-js';
import { DependencyInjectionMnemonicProvider } from '../common/mnemonic';
import { DependencyInjectionUserProvider } from '../common/user';
import { ContentsContainer } from './ContentsContainer';
import { DependencyInjectionEventRepository } from '../common/eventRepository';
import { ContentsUploader } from '../../../../../context/drive/contents/application/ContentsUploader';
import { NotifyMainProcessHydrationFinished } from '../../../../../context/drive/contents/application/NotifyMainProcessHydrationFinished';
import { RetryContentsUploader } from '../../../../../context/drive/contents/application/RetryContentsUploader';
import { ContentsDownloader } from '../../../../../context/drive/contents/application/download/ContentsDownloader';
import { EnvironmentRemoteFileContentsManagersFactory } from '../../../../../context/drive/contents/infrastructure/EnvironmentRemoteFileContentsManagersFactory';
import { IPCLocalFileContentsDirectoryProvider } from '../../../../../context/drive/shared/infrastructure/LocalFileContentsDirectoryProviders/IPCLocalFileContentsDirectoryProvider';
import { ipcRendererSyncEngine } from '../../../ipcRendererSyncEngine';

export async function buildContentsContainer(): Promise<ContentsContainer> {
  const user = DependencyInjectionUserProvider.get();
  const mnemonic = DependencyInjectionMnemonicProvider.get();
  const eventRepository = DependencyInjectionEventRepository.get();

  const environment = new Environment({
    bridgeUrl: process.env.BRIDGE_URL,
    bridgeUser: user.bridgeUser,
    bridgePass: user.userId,
    encryptionKey: mnemonic,
  });

  const contentsManagerFactory =
    new EnvironmentRemoteFileContentsManagersFactory(environment, user.bucket);

  const contentsUploader = new ContentsUploader(
    contentsManagerFactory,
    ipcRendererSyncEngine
  );

  const retryContentsUploader = new RetryContentsUploader(contentsUploader);

  const localFileContentsDirectoryProvider =
    new IPCLocalFileContentsDirectoryProvider();

  const contentsDownloader = new ContentsDownloader(
    contentsManagerFactory,
    ipcRendererSyncEngine,
    localFileContentsDirectoryProvider
  );

  const notifyMainProcessHydrationFinished =
    new NotifyMainProcessHydrationFinished(
      eventRepository,
      ipcRendererSyncEngine
    );

  return {
    contentsUploader: retryContentsUploader,
    contentsDownloader,
    localFileContentsDirectoryProvider,
    notifyMainProcessHydrationFinished,
  };
}
