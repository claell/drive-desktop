import Logger from 'electron-log';
import { LocalFileIdProvider } from '../../shared/application/LocalFileIdProvider';
import { File } from '../domain/File';
import { FileRepository } from '../domain/FileRepository';
import { FileStatuses } from '../domain/FileStatus';
import { EventBus } from '../../shared/domain/EventBus';

export class FilesPlaceholderUpdater {
  constructor(
    private readonly repository: FileRepository,
    private readonly localFileIdProvider: LocalFileIdProvider,
    private readonly eventBus: EventBus
  ) {}

  private hasToBeDeleted(local: File, remote: File): boolean {
    const localExists = local.status.is(FileStatuses.EXISTS);
    const remoteIsTrashed = remote.status.is(FileStatuses.TRASHED);
    const remoteIsDeleted = remote.status.is(FileStatuses.DELETED);
    return localExists && (remoteIsTrashed || remoteIsDeleted);
  }

  private async update(remote: File): Promise<void> {
    const local = this.repository.searchByPartial({
      contentsId: remote.contentsId,
    });

    if (!local) {
      if (remote.status.is(FileStatuses.EXISTS)) {
        Logger.debug('Creating file placeholder: ', remote.path);
        await this.repository.upsert(remote);
      }
      return;
    }

    if (local.path !== remote.path) {
      Logger.debug('Updating file placeholder: ', remote.path);
      const trackerId = await this.localFileIdProvider.run(local.path);

      local.update(remote, trackerId);
      await this.repository.upsert(remote);

      this.eventBus.publish(local.pullDomainEvents());
    }

    if (this.hasToBeDeleted(local, remote)) {
      local.trash();
      this.repository.delete(local.contentsId);
    }
  }

  async run(remotes: Array<File>): Promise<void> {
    const updatePromises = remotes.map((remote) => this.update(remote));

    await Promise.all(updatePromises);
  }
}
