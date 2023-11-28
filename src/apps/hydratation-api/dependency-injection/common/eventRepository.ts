import { EventRepository } from '../../../../context/drive/shared/domain/EventRepository';
import { InMemoryEventRepository } from '../../../../context/drive/shared/infrastructure/InMemoryEventHistory';

export class DependencyInjectionEventRepository {
  private static history: EventRepository;

  static get(): EventRepository {
    if (DependencyInjectionEventRepository.history) {
      return DependencyInjectionEventRepository.history;
    }

    DependencyInjectionEventRepository.history = new InMemoryEventRepository();

    return DependencyInjectionEventRepository.history;
  }
}
