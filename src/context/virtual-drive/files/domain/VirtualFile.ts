import { FilePath } from '../../../drive/files/domain/FilePath';
import { BucketEntryId } from '../../../drive/shared/domain/BucketEntryId';
import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { VirtualFileId } from './VirtualFileId';

export type VirtualFileAttributes = {
  id: string;
  path: string;
  size: number;
  createdAt: number;
  updatedAt: number;
};

export class VirtualFile extends AggregateRoot {
  private constructor(
    private _id: VirtualFileId,
    private _contentsId: BucketEntryId,
    private _path: FilePath,
    private _size: number,
    private _createdAt: number,
    private _updatedAt: number
  ) {
    super();
  }

  get id(): string {
    return this._id.value;
  }

  get path(): string {
    return this._path.value;
  }

  get size(): number {
    return this._size;
  }
  get createdAt(): number {
    return this._createdAt;
  }
  get updatedAt(): number {
    return this._updatedAt;
  }

  get contentsId(): string {
    return this._contentsId.value;
  }

  static from(attributes: VirtualFileAttributes): VirtualFile {
    return new VirtualFile(
      VirtualFileId.fromContentsId(attributes.id),
      new BucketEntryId(attributes.id),
      new FilePath(attributes.path),
      attributes.size,
      attributes.createdAt,
      attributes.updatedAt
    );
  }

  attributes(): VirtualFileAttributes {
    return {
      id: this.id,
      path: this.path,
      size: this._size,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
