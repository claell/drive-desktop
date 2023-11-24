import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { ContentsId } from './ContentsId';
import { ContentsSize } from './ContentsSize';

export type VirtualContentsAttributes = {
  id: string;
  size: number;
};

export class VirtualContents extends AggregateRoot {
  private constructor(
    private readonly _id: ContentsId,
    private readonly _size: ContentsSize
  ) {
    super();
  }

  public get id(): string {
    return this._id.value;
  }

  public get size(): number {
    return this._size.value;
  }

  static create(id: ContentsId, size: number): VirtualContents {
    return new VirtualContents(id, new ContentsSize(size));
  }

  static from(attributes: VirtualContentsAttributes): VirtualContents {
    return new VirtualContents(
      new ContentsId(attributes.id),
      new ContentsSize(attributes.size)
    );
  }

  attributes() {
    return {
      contentsId: this.id,
      size: this.size,
    };
  }
}
