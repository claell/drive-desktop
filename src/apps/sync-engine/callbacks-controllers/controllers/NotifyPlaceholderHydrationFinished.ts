import { NotifyMainProcessHydrationFinished } from '../../../../context/drive/contents/application/NotifyMainProcessHydrationFinished';
import { FilePlaceholderId } from '../../../../context/virtual-drive/files/domain/VirtualFileId';
import { CallbackController } from './CallbackController';

export class NotifyPlaceholderHydrationFinished extends CallbackController {
  constructor(private readonly notifier: NotifyMainProcessHydrationFinished) {
    super();
  }

  async execute(filePlaceholderId: FilePlaceholderId) {
    const trimmedId = this.trim(filePlaceholderId);
    const [_, contentsId] = trimmedId.split(':');

    if (!contentsId) return;

    await this.notifier.run(contentsId);
  }
}
