import { FilesByFolderPathSearcher } from '../../../../context/drive/files/application/FilesByFolderPathSearcher';
import { FilesSearcher } from '../../../../context/drive/files/application/FilesSearcher';

export interface FilesContainer {
  filesByFolderPathNameLister: FilesByFolderPathSearcher;
  filesSearcher: FilesSearcher;
}
