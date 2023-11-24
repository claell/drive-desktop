import { FileAddedDomainEvent } from '../../../../drive/files/domain/events/FileAddedDomainEvent';
import { DomainEventClass } from '../../../../shared/domain/DomainEvent';
import { DomainEventSubscriber } from '../../../../shared/domain/DomainEventSubscriber';
import { FilePlaceholderCreatorFromContentsId } from '../FilePlaceholderCreatorFromContentsId';

export class CreateFilePlaceholderOnFileAdded
  implements DomainEventSubscriber<FileAddedDomainEvent>
{
  constructor(private readonly creator: FilePlaceholderCreatorFromContentsId) {}

  subscribedTo(): DomainEventClass[] {
    return [FileAddedDomainEvent];
  }

  async on(domainEvent: FileAddedDomainEvent): Promise<void> {
    this.creator.run(domainEvent.aggregateId);
  }
}
