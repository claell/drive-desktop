import { Traverser } from '../../../../context/drive/items/application/Traverser';
import { TreeBuilder } from '../../../../context/drive/items/application/TreeBuilder';
import { CryptoJsNameDecrypt } from '../../../../context/drive/items/infrastructure/CryptoJsNameDecrypt';
import { IpcRemoteItemsGenerator } from '../../../../context/drive/items/infrastructure/IpcRemoteItemsGenerator';
import { getUser } from '../../../main/auth/service';
import { ipcRendererSyncEngine } from '../../ipcRendererSyncEngine';
import { ItemsContainer } from '../drive/items/ItemsContainer';

export function buildItemsContainer(): ItemsContainer {
  const user = getUser();

  if (!user) {
    throw new Error('Could not get user when building Items dependencies');
  }

  const remoteItemsGenerator = new IpcRemoteItemsGenerator(
    ipcRendererSyncEngine
  );

  const nameDecryptor = new CryptoJsNameDecrypt();

  const existingItemsTraverser = Traverser.existingItems(
    nameDecryptor,
    user.root_folder_id
  );
  const allStatusesTraverser = Traverser.allItems(
    nameDecryptor,
    user.root_folder_id
  );
  const treeBuilder = new TreeBuilder(
    remoteItemsGenerator,
    existingItemsTraverser
  );

  const allStatusesTreeBuilder = new TreeBuilder(
    remoteItemsGenerator,
    allStatusesTraverser
  );

  return {
    existingItemsTreeBuilder: treeBuilder,
    allStatusesTreeBuilder,
  };
}
