import { DomainEvent } from '../../../../shared/domain/DomainEvent';

export class FileDeletionFailedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME = 'file.deletion.failed';

  constructor({ aggregateId }: { aggregateId: string }) {
    super({
      eventName: FileDeletionFailedDomainEvent.EVENT_NAME,
      aggregateId,
    });
  }

  toPrimitives() {
    return {
      contentsId: this.aggregateId,
    };
  }
}
