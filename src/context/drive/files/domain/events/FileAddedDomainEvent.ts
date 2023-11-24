import { DomainEvent } from '../../../../shared/domain/DomainEvent';

export class FileAddedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME: 'file.added';

  constructor({ aggregateId }: { aggregateId: string }) {
    super({
      eventName: FileAddedDomainEvent.EVENT_NAME,
      aggregateId,
      eventId: undefined,
    });
  }

  toPrimitives() {
    return {};
  }
}
