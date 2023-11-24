import { FileUpdatedDomainEvent } from '../../../../drive/files/domain/events/FileUpdatedDomainEvent';
import { DomainEventClass } from '../../../../shared/domain/DomainEvent';
import { DomainEventSubscriber } from '../../../../shared/domain/DomainEventSubscriber';
import { FilePlaceholderUpdater } from '../FilePlaceholderUpdater';

export class UpdateFilePlaceholderOnFileUpdated
  implements DomainEventSubscriber<FileUpdatedDomainEvent>
{
  constructor(
    private readonly filePlaceholderUpdater: FilePlaceholderUpdater
  ) {}

  subscribedTo(): DomainEventClass[] {
    return [FileUpdatedDomainEvent];
  }

  async on(domainEvent: FileUpdatedDomainEvent): Promise<void> {
    this.filePlaceholderUpdater.run(
      domainEvent.aggregateId,
      domainEvent.previousPath
    );
  }
}
