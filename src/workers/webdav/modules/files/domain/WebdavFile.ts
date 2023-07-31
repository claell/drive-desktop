import { AggregateRoot } from '../../shared/domain/AggregateRoot';
import { WebdavFolder } from '../../folders/domain/WebdavFolder';
import { FilePath } from './FilePath';
import { FileSize } from './FileSize';
import { FileCreatedDomainEvent } from './FileCreatedDomainEvent';
import { FileCannotBeMovedToTheOriginalFolderError } from './errors/FileCannotBeMovedToTheOriginalFolderError';
import { FileActionOnlyCanAffectOneLevelError } from './errors/FileActionOnlyCanAffectOneLevelError';
import { FileNameShouldDifferFromOriginalError } from './errors/FileNameShouldDifferFromOriginalError';
import { FileActionCannotModifyExtension } from './errors/FileActionCannotModifyExtension';
import { FileDeletedDomainEvent } from './FileDeletedDomainEvent';
import { FileStatus, FileStatuses } from './FileStatus';
import { FileId } from './FileId';
import { ContentsId } from './ContentsId';

export type WebdavFileAtributes = {
  id: string;
  contentsId: string;
  folderId: number;
  createdAt: string;
  modificationTime: string;
  path: string;
  size: number;
  updatedAt: string;
  status: string;
};

export class WebdavFile extends AggregateRoot {
  private _lastPath: FilePath | null = null;
  private constructor(
    private _id: FileId,
    private _contentsId: ContentsId,
    private _folderId: number,
    private _path: FilePath,
    private readonly _size: FileSize,
    public createdAt: Date,
    public updatedAt: Date,
    private _status: FileStatus
  ) {
    super();
  }

  public get id(): string {
    return this._id.value;
  }

  public get contentsId(): string {
    return this._contentsId.value;
  }

  public get folderId() {
    return this._folderId;
  }

  public get path() {
    return this._path;
  }

  public get lastPath() {
    return this._lastPath;
  }

  public get type() {
    return this._path.extension();
  }

  public get name() {
    return this._path.name();
  }

  public get nameWithExtension() {
    return this._path.nameWithExtension();
  }

  public get dirname() {
    return this._path.dirname();
  }

  public get size(): number {
    return this._size.value;
  }

  public get status() {
    return this._status;
  }

  static from(attributes: WebdavFileAtributes): WebdavFile {
    return new WebdavFile(
      new FileId(attributes.id),
      new ContentsId(attributes.id),
      attributes.folderId,
      new FilePath(attributes.path),
      new FileSize(attributes.size),
      new Date(attributes.createdAt),
      new Date(attributes.updatedAt),
      FileStatus.fromValue(attributes.status)
    );
  }

  static create(
    contentsId: ContentsId,
    folder: WebdavFolder,
    size: number,
    path: FilePath
  ): WebdavFile {
    const id = FileId.random();

    const file = new WebdavFile(
      id,
      contentsId,
      folder.id,
      path,
      new FileSize(size),
      new Date(),
      new Date(),
      FileStatus.Exists
    );

    file.record(
      new FileCreatedDomainEvent({
        aggregateId: id.value,
        size,
        type: path.extension(),
      })
    );

    return file;
  }

  trash() {
    this._status = this._status.changeTo(FileStatuses.TRASHED);

    this.record(
      new FileDeletedDomainEvent({
        aggregateId: this.id,
        size: this._size.value,
      })
    );
  }

  moveTo(folder: WebdavFolder): void {
    if (this.folderId === folder.id) {
      throw new FileCannotBeMovedToTheOriginalFolderError(this.path.value);
    }

    this._folderId = folder.id;
    this._lastPath = this._path;
    this._path = this._path.changeFolder(folder.path.value);

    //TODO: record file moved event
  }

  clone(contentsId: ContentsId, folderId: number, newPath: FilePath) {
    // if (!this._path.hasSameDirname(newPath)) {
    //   throw new FileActionOnlyCanAffectOneLevelError('clone');
    // }

    // if (this._path.hasSameName(newPath)) {
    //   throw new FileNameShouldDifferFromOriginalError('clone');
    // }

    const id = FileId.random();

    const file = new WebdavFile(
      id,
      contentsId,
      folderId,
      newPath,
      this._size,
      this.createdAt,
      new Date(),
      FileStatus.Exists
    );

    file.record(
      new FileCreatedDomainEvent({
        aggregateId: id.value,
        size: this._size.value,
        type: this._path.extension(),
      })
    );

    return file;
  }

  overwrite(contentsId: ContentsId, folderId: number, newPath: FilePath) {
    const id = FileId.random();
    const file = new WebdavFile(
      id,
      contentsId,
      folderId,
      newPath,
      this._size,
      this.createdAt,
      new Date(),
      FileStatus.Exists
    );

    file.record(
      new FileCreatedDomainEvent({
        aggregateId: contentsId.value,
        size: this._size.value,
        type: this._path.extension(),
      })
    );

    return file;
  }

  rename(newPath: FilePath) {
    if (!this._path.hasSameDirname(newPath)) {
      throw new FileActionOnlyCanAffectOneLevelError('rename');
    }

    if (!newPath.hasSameExtension(this._path)) {
      throw new FileActionCannotModifyExtension('rename');
    }

    if (this._path.hasSameName(newPath)) {
      throw new FileNameShouldDifferFromOriginalError('rename');
    }

    this._lastPath = this._path;
    this._path = this._path.updateName(newPath.nameWithExtension());

    // TODO: record rename event
  }

  hasParent(id: number): boolean {
    return this.folderId === id;
  }

  isFolder(): this is WebdavFolder {
    return false;
  }

  isFile(): this is WebdavFile {
    return true;
  }

  hasStatus(status: FileStatuses): boolean {
    return this._status.is(status);
  }

  update(
    attributes: Partial<
      Pick<
        WebdavFileAtributes,
        'path' | 'createdAt' | 'updatedAt' | 'folderId' | 'status'
      >
    >
  ) {
    if (attributes.path) {
      this._path = new FilePath(attributes.path);
    }

    if (attributes.createdAt) {
      this.createdAt = new Date(attributes.createdAt);
    }

    if (attributes.updatedAt) {
      this.updatedAt = new Date(attributes.updatedAt);
    }

    if (attributes.folderId) {
      this._folderId = attributes.folderId;
    }

    if (attributes.status) {
      this._status = FileStatus.fromValue(attributes.status);
    }

    return this;
  }

  toPrimitives() {
    return {
      fileId: this.id,
      folderId: this.folderId,
      createdAt: this.createdAt.getDate(),
      path: this._path.value,
      size: this._size.value,
      updatedAt: this.updatedAt.getDate(),
    };
  }

  attributes(): WebdavFileAtributes {
    return {
      id: this.id,
      contentsId: this.contentsId,
      folderId: this.folderId,
      createdAt: this.createdAt.toISOString(),
      path: this._path.value,
      size: this._size.value,
      updatedAt: this.updatedAt.toISOString(),
      status: this.status.value,
      modificationTime: this.updatedAt.toISOString(),
    };
  }
}
