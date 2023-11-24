import { FileDeletedDomainEvent } from '../../../../drive/files/domain/events/FileDeletedDomainEvent';
import { DomainEventClass } from '../../../../shared/domain/DomainEvent';
import { DomainEventSubscriber } from '../../../../shared/domain/DomainEventSubscriber';
import { FilePlaceholderDeleter } from '../FilePlaceholderDeleter';

export class DeleteFilePlaceholderOnFileTrashed
  implements DomainEventSubscriber<FileDeletedDomainEvent>
{
  constructor(private readonly deleter: FilePlaceholderDeleter) {}

  subscribedTo(): DomainEventClass[] {
    return [FileDeletedDomainEvent];
  }

  async on(domainEvent: FileDeletedDomainEvent): Promise<void> {
    this.deleter.run(domainEvent.aggregateId);
  }
}
