import Logger from 'electron-log';
import { DependencyContainer } from './dependency-injection/DependencyContainer';
import { buildControllers } from './callbacks-controllers/buildControllers';
import { VirtualDrive } from 'virtual-drive/dist';
import { executeControllerWithFallback } from './callbacks-controllers/middlewares/executeControllerWithFallback';
import { FilePlaceholderId } from './modules/placeholders/domain/FilePlaceholderId';

export type CallbackDownload = (
  success: boolean,
  filePath: string
) => Promise<{ finished: boolean; progress: number }>;
export class BindingsManager {
  private static readonly PROVIDER_NAME = 'Internxt';

  constructor(
    private readonly container: DependencyContainer,
    private readonly paths: {
      root: string;
      icon: string;
    }
  ) {}

  async start(version: string, providerId: string) {
    await this.stop();

    const controllers = buildControllers(this.container);

    const callbacks = {
      notifyDeleteCallback: (
        contentsId: string,
        callback: (response: boolean) => void
      ) => {
        controllers.delete
          .execute(contentsId)
          .then(() => {
            callback(true);
          })
          .catch((error: Error) => {
            Logger.error(error);
            callback(false);
          });
      },
      notifyDeleteCompletionCallback: () => {
        Logger.info('Deletion completed');
      },
      notifyRenameCallback: (
        absolutePath: string,
        contentsId: string,
        callback: (response: boolean) => void
      ) => {
        const fn = executeControllerWithFallback({
          handler: controllers.renameOrMove.execute.bind(
            controllers.renameOrMove
          ),
          fallback: controllers.offline.renameOrMove.execute.bind(
            controllers.offline.renameOrMove
          ),
        });
        fn(absolutePath, contentsId, callback);
      },
      notifyFileAddedCallback: (
        absolutePath: string,
        callback: (acknowledge: boolean, id: string) => boolean
      ) => {
        controllers.addFile.execute(absolutePath, callback);
      },
      fetchDataCallback: async (
        contentsId: FilePlaceholderId,
        callback: CallbackDownload
      ) => {
        try {
          const path = await controllers.downloadFile.execute(
            contentsId,
            callback
          );
          Logger.debug('Execute Fetch Data Callback, sending path:', path);

          let finished = false;
          let result;
          while (!finished) {
            Logger.debug('new callback', finished);
            // eslint-disable-next-line no-await-in-loop
            result = await callback(true, path);
            finished = result.finished;
            Logger.debug('condition', finished);
          }

          try {
            await controllers.notifyPlaceholderHydrationFinished.execute(
              contentsId
            );
          } catch (error) {
            Logger.error('notify: ', error);
          }

          // Esperar hasta que la ejecución de fetchDataCallback esté completa antes de continuar
          await new Promise((resolve) => {
            setTimeout(() => {
              Logger.debug('timeout');
              resolve(true);
            }, 500);
          });
        } catch (error) {
          Logger.error(error);
          callback(false, '');
        }
      },
      validateDataCallback: () => {
        Logger.debug('validateDataCallback');
      },
      cancelFetchDataCallback: () => {
        Logger.debug('cancelFetchDataCallback');
      },
      fetchPlaceholdersCallback: () => {
        Logger.debug('fetchPlaceholdersCallback');
      },
      cancelFetchPlaceholdersCallback: () => {
        Logger.debug('cancelFetchPlaceholdersCallback');
      },
      notifyFileOpenCompletionCallback: () => {
        Logger.debug('notifyFileOpenCompletionCallback');
      },
      notifyFileCloseCompletionCallback: () => {
        Logger.debug('notifyFileCloseCompletionCallback');
      },
      notifyDehydrateCallback: () => {
        Logger.debug('notifyDehydrateCallback');
      },
      notifyDehydrateCompletionCallback: () => {
        Logger.debug('notifyDehydrateCompletionCallback');
      },
      notifyRenameCompletionCallback: () => {
        Logger.debug('notifyRenameCompletionCallback');
      },
      noneCallback: () => {
        Logger.debug('noneCallback');
      },
    };

    await this.container.virtualDrive.registerSyncRoot(
      BindingsManager.PROVIDER_NAME,
      version,
      providerId,
      callbacks,
      this.paths.icon
    );

    await this.container.virtualDrive.connectSyncRoot();
  }

  watch() {
    this.container.virtualDrive.watchAndWait(this.paths.root);
  }

  async stop() {
    await this.container.virtualDrive.disconnectSyncRoot();
  }

  cleanUp() {
    VirtualDrive.unregisterSyncRoot(this.paths.root);
  }
}
