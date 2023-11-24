import { AbsolutePathToRelativeConverter } from '../../../../context/drive/shared/application/AbsolutePathToRelativeConverter';
import { RelativePathToAbsoluteConverter } from '../../../../context/drive/shared/application/RelativePathToAbsoluteConverter';

export interface SharedContainer {
  absolutePathToRelativeConverter: AbsolutePathToRelativeConverter;
  relativePathToAbsoluteConverter: RelativePathToAbsoluteConverter;
}
