import { VirtualContents } from '../../../../../src/context/virtual-drive/contents/domain/VirtualContents';
import { ContentsIdMother } from './ContentsIdMother';
import { ContentsSizeMother } from './ContentsSizeMother';

export class FileContentsMother {
  static random(): VirtualContents {
    return VirtualContents.from({
      id: ContentsIdMother.random().value,
      size: ContentsSizeMother.random().value,
    });
  }
}
