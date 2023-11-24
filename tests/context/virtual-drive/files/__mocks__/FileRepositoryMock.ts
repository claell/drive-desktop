import { Nullable } from '../../../../../src/apps/shared/types/Nullable';
import { FileAttributes } from '../../../../../src/context/drive/files/domain/File';
import { FileRepository } from '../../../../../src/context/drive/files/domain/FileRepository';
import { File } from '../../../../../src/context/drive/files/domain/File';

export class FileRepositoryMock implements FileRepository {
  public readonly allMock = jest.fn();
  public readonly searchByPartialMock = jest.fn();
  public readonly listByPartialMock = jest.fn();
  public readonly deleteMock = jest.fn();
  public readonly upsertMock = jest.fn();

  all(): Promise<File[]> {
    return this.allMock();
  }
  searchByPartial(partial: Partial<FileAttributes>): Nullable<File> {
    return this.searchByPartialMock(partial);
  }
  listByPartial(partial: Partial<FileAttributes>): Promise<File[]> {
    return this.listByPartialMock(partial);
  }
  delete(id: string): Promise<void> {
    return this.deleteMock(id);
  }
  upsert(file: File): Promise<void> {
    return this.upsertMock(file);
  }
}
