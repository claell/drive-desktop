import {
  FileAttributes,
  File,
} from '../../../../../src/context/drive/files/domain/File';
import { FileStatuses } from '../../../../../src/context/drive/files/domain/FileStatus';
import { ContentsIdMother } from '../../contents/domain/ContentsIdMother';
import { FilePathMother } from './FilePathMother';
import Chance from 'chance';

const chance = new Chance();

export class FileMother {
  static onFolderName(path: string) {
    return File.from({
      id: chance.integer({ min: 1000 }),
      contentsId: ContentsIdMother.random().value,
      folderId: 3972,
      createdAt: new Date().toISOString(),
      modificationTime: new Date().toISOString(),
      path: `/${path}/Dilbusege.png`,
      size: 8939,
      updatedAt: new Date().toISOString(),
      status: FileStatuses.EXISTS,
    });
  }

  static fromPath(path: string) {
    return File.from({
      id: chance.integer({ min: 1000 }),
      contentsId: ContentsIdMother.random().value,
      folderId: 3972960,
      createdAt: new Date().toISOString(),
      modificationTime: new Date().toISOString(),
      path: path,
      size: 893924973,
      updatedAt: new Date().toISOString(),
      status: FileStatuses.EXISTS,
    });
  }

  static any() {
    return File.from({
      id: chance.integer({ min: 1000 }),
      contentsId: ContentsIdMother.random().value,
      folderId: 3972960,
      createdAt: new Date().toISOString(),
      modificationTime: new Date().toISOString(),
      path: FilePathMother.random(2).value,
      size: 893924973,
      updatedAt: new Date().toISOString(),
      status: FileStatuses.EXISTS,
    });
  }

  static fromPartial(partial: Partial<FileAttributes>) {
    return File.from({
      id: chance.integer({ min: 1000 }),
      contentsId: ContentsIdMother.random().value,
      folderId: 3972960,
      createdAt: new Date().toISOString(),
      modificationTime: new Date().toISOString(),
      path: FilePathMother.random().value,
      size: 893924973,
      updatedAt: new Date().toISOString(),
      status: FileStatuses.EXISTS,
      ...partial,
    });
  }
}
