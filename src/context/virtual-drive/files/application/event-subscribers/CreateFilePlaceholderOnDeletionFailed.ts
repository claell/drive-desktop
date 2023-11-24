import { DomainEventClass } from '../../../../shared/domain/DomainEvent';
import { DomainEventSubscriber } from '../../../../shared/domain/DomainEventSubscriber';
import { FileDeletionFailedDomainEvent } from '../../../../drive/files/domain/events/FileDeletionFailedDomainEvent';
import { FilePlaceholderCreatorFromContentsId } from '../FilePlaceholderCreatorFromContentsId';

export class CreateFilePlaceholderOnDeletionFailed
  implements DomainEventSubscriber<FileDeletionFailedDomainEvent>
{
  constructor(private readonly creator: FilePlaceholderCreatorFromContentsId) {}

  subscribedTo(): DomainEventClass[] {
    return [FileDeletionFailedDomainEvent];
  }

  async on(domainEvent: FileDeletionFailedDomainEvent): Promise<void> {
    this.creator.run(domainEvent.toPrimitives().contentsId);
  }
}
