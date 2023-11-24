import { Readable } from 'stream';
import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { ContentsSize } from '../../../drive/contents/domain/ContentsSize';
import { ContentsDownloadedDomainEvent } from '../../../drive/contents/domain/events/ContentsDownloadedDomainEvent';
import { File } from '../../../drive/files/domain/File';

export type LocalContentsAttributes = {
  name: string;
  extension: string;
  size: number;
  birthTime: number;
  modifiedTime: number;
  contents: Readable;
};

export class LocalContents extends AggregateRoot {
  private constructor(
    private readonly _name: string,
    private readonly _extension: string,
    private readonly _size: ContentsSize,
    private readonly _birthTime: number,
    private readonly _modifiedTime: number,
    public readonly stream: Readable
  ) {
    super();
  }

  public get name(): string {
    return this._name;
  }
  public get extension(): string {
    return this._extension;
  }

  public get nameWithExtension(): string {
    return this.name + (this.extension.length >= 0 ? '.' + this.extension : '');
  }

  public get size(): number {
    return this._size.value;
  }

  public get birthTime(): number {
    return this._birthTime;
  }

  public get modifiedTime(): number {
    return this._modifiedTime;
  }

  static from(attributes: LocalContentsAttributes): LocalContents {
    const remoteContents = new LocalContents(
      attributes.name,
      attributes.extension,
      new ContentsSize(attributes.size),
      attributes.birthTime,
      attributes.modifiedTime,
      attributes.contents
    );

    return remoteContents;
  }

  static downloadedFrom(file: File, contents: Readable) {
    const remoteContents = new LocalContents(
      file.name,
      file.type,
      new ContentsSize(file.size),
      file.createdAt.getUTCMilliseconds(),
      file.updatedAt.getUTCMilliseconds(),
      contents
    );

    const contentsDownloadedEvent = new ContentsDownloadedDomainEvent({
      aggregateId: file.contentsId,
      name: file.name,
      extension: file.type,
      nameWithExtension: file.nameWithExtension,
      size: file.size,
    });

    remoteContents.record(contentsDownloadedEvent);

    return remoteContents;
  }

  attributes(): Omit<LocalContentsAttributes, 'contents'> {
    return {
      name: this.name,
      extension: this.extension,
      size: this.size,
      birthTime: this.birthTime,
      modifiedTime: this.modifiedTime,
    };
  }
}
