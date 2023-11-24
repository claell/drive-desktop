import { EventRepository } from '../../../../../src/context/drive/shared/domain/EventRepository';
import { DomainEvent } from '../../../../../src/context/shared/domain/DomainEvent';

export class EventRepositoryMock implements EventRepository {
  public readonly storeMock = jest.fn();
  public readonly searchMock = jest.fn();

  store(event: DomainEvent): Promise<void> {
    return this.storeMock(event);
  }
  search(aggregateId: string): Promise<DomainEvent[]> {
    return this.searchMock(aggregateId);
  }
}
