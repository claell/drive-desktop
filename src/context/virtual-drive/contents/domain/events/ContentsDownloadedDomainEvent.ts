import { DomainEvent } from '../../../../shared/domain/DomainEvent';

export class ContentsDownloadedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME: 'contents.downloaded';

  readonly name: string;
  readonly extension: string;
  readonly nameWithExtension: string;
  readonly size: number;

  constructor({
    aggregateId,
    eventId,
    name,
    extension,
    nameWithExtension,
    size,
  }: {
    aggregateId: string;
    name: string;
    extension: string;
    nameWithExtension: string;
    size: number;
    eventId?: string;
  }) {
    super({
      eventName: 'contents.downloaded',
      aggregateId,
      eventId,
    });

    this.name = name;
    this.extension = extension;
    this.nameWithExtension = nameWithExtension;
    this.size = size;
  }

  toPrimitives() {
    return {
      aggregateId: this.aggregateId,
      eventId: this.eventId,
      name: this.name,
      extension: this.extension,
      nameWithExtension: this.nameWithExtension,
      size: this.size,
    };
  }
}
