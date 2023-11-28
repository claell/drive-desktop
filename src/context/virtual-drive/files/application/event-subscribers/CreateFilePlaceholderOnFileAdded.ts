import { FileAddedDomainEvent } from '../../../../drive/files/domain/events/FileAddedDomainEvent';
import { DomainEventClass } from '../../../../shared/domain/DomainEvent';
import { DomainEventSubscriber } from '../../../../shared/domain/DomainEventSubscriber';
import { FilePlaceholderCreatorFromContentsId } from '../FilePlaceholderCreatorFromContentsId';
import Logger from 'electron-log';

export class CreateFilePlaceholderOnFileAdded
  implements DomainEventSubscriber<FileAddedDomainEvent>
{
  constructor(private readonly creator: FilePlaceholderCreatorFromContentsId) {}

  subscribedTo(): DomainEventClass[] {
    return [FileAddedDomainEvent];
  }

  async on(domainEvent: FileAddedDomainEvent): Promise<void> {
    Logger.log('Create File Placeholder On File Added');

    this.creator.run(domainEvent.aggregateId);
  }
}
