import { DomainEventSubscriber } from '../domain/DomainEventSubscriber';
import { DomainEvent } from '../domain/DomainEvent';
import {
  DependencyContainer,
  Deps,
} from '../../../apps/shared/DependencyContainer';

export class DomainEventSubscribers {
  constructor(public items: Array<DomainEventSubscriber<DomainEvent>>) {}

  static from<T extends Deps>(
    container: DependencyContainer<T>
  ): DomainEventSubscribers {
    const subscribers = container.subscribers().map((subscriber) => {
      return container.dependencies[subscriber];
    }) as unknown as Array<DomainEventSubscriber<DomainEvent>>;

    return new DomainEventSubscribers(subscribers);
  }
}
