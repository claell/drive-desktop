import { LocalContentsReader } from '../../../../../context/local-drive/contents/application/LocalContentsReader';
import { LocalContentsWriter } from '../../../../../context/local-drive/contents/application/LocalContentsWriter';

export interface LocalDriveContentsContainer {
  localContentsReader: LocalContentsReader;
  localContentsWriter: LocalContentsWriter;
}
