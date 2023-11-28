import { FolderFinder } from '../../../../context/drive/folders/application/FolderFinder';
import { FolderSearcher } from '../../../../context/drive/folders/application/FolderSearcher';
import { FoldersByParentPathSearcher } from '../../../../context/drive/folders/application/FoldersByParentPathNameLister';

export interface FoldersContainer {
  folderFinder: FolderFinder;
  folderSearcher: FolderSearcher;
  foldersByParentPathSearcher: FoldersByParentPathSearcher;
}
