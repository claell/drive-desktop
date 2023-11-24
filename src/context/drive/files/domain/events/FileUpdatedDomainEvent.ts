import { DomainEvent } from '../../../../shared/domain/DomainEvent';

export class FileUpdatedDomainEvent extends DomainEvent {
  static readonly EVENT_NAME: 'file.updated';

  // TODO: Add the missing properties that can change
  readonly previousPath: string;

  constructor({
    aggregateId,
    previousPath,
  }: {
    aggregateId: string;
    previousPath: string;
  }) {
    super({
      eventName: FileUpdatedDomainEvent.EVENT_NAME,
      aggregateId,
    });

    this.previousPath = previousPath;
  }

  toPrimitives() {
    return {
      contentsId: this.aggregateId,
    };
  }
}
