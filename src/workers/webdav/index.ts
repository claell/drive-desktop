import Logger from 'electron-log';
import { ipcRenderer } from 'electron';
import { DependencyContainerFactory } from './dependencyInjection/DependencyContainerFactory';
import { VirtualDrive } from 'virtual-drive/dist';
import packageJson from '../../../package.json';
import { BindingsManager } from './BindingManager';
import fs from 'fs/promises';
import { run } from './shellIntegration';

async function ensureTheFolderExist(path: string) {
  try {
    await fs.access(path);
  } catch {
    Logger.info('ROOT FOLDER ', path, 'NOT FOUND, CREATING IT...');
    await fs.mkdir(path);
  }
}

async function setUp() {
  try {
    Logger.debug('STARTING SYNC ENGINE PROCESS');

    const virtualDrivePath = await ipcRenderer.invoke('get-virtual-drive-root');

    Logger.info('WATCHING ON PATH: ', virtualDrivePath);

    Logger.info('SETTING UP SHELL INTEGRATION...');
    await run();

    await ensureTheFolderExist(virtualDrivePath);

    const virtualDrive = new VirtualDrive(virtualDrivePath);

    ipcRenderer.on('STOP_SYNC_ENGINE_PROCESS', async (event) => {
      await virtualDrive.unregisterSyncRoot();

      event.sender.send('SYNC_ENGINE_STOP_SUCCESS');
    });

    const factory = new DependencyContainerFactory();
    const container = await factory.build();

    const bindings = new BindingsManager(
      virtualDrive,
      container,
      virtualDrivePath
    );

    await bindings.start(
      packageJson.version,
      '{12345678-1234-1234-1234-123456789012}'
    );
  } catch (error) {
    Logger.debug('ERROR ON SETTING UP', error);
  }
}

setUp().catch((err) => {
  Logger.error(err);
});
