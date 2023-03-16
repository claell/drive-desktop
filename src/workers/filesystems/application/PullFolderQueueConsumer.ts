import async from 'async';
import Logger from 'electron-log';
import EventEmitter from 'events';
import { PartialListing } from '../../sync/Listings/domain/Listing';
import { FileSystem } from '../domain/FileSystem';

type QueueByNestLevel = Array<Array<string>>;

export class PullFolderQueueConsumer {
  private static readonly MAX_CALLS_PER_LEVEL = 10;

  constructor(
    private readonly fileSystem: FileSystem<PartialListing>,
    private readonly eventEmiter: EventEmitter
  ) {}

  private divideByLevel(queue: Array<string>): QueueByNestLevel {
    const sortBySubfolderLevel = (pathA: string, pathB: string) =>
      pathA.split('/').length - pathB.split('/').length;

    const sorted = queue.sort(sortBySubfolderLevel);

    return sorted.reduce((nestedQueues, path: string) => {
      const lastLevelPaths = nestedQueues[nestedQueues.length - 1] || [];
      const lastPathAdded = lastLevelPaths[lastLevelPaths.length - 1];

      if (!lastPathAdded) {
        nestedQueues.push([path]);
        return nestedQueues;
      }

      const lastLevel = lastPathAdded.split('/').length;
      const currentLevel = path.split('/').length;

      if (currentLevel > lastLevel) {
        nestedQueues.push([path]);
      } else {
        nestedQueues[nestedQueues.length - 1].push(path);
      }

      return nestedQueues;
    }, [] as QueueByNestLevel);
  }

  async consume(queue: Array<string>): Promise<void> {
    const queuesByLevel = this.divideByLevel(queue);

    const pullFolder = async (folderName: string): Promise<void> => {
      this.eventEmiter.emit('PULLING_FOLDER', folderName, this.fileSystem.kind);

      await this.fileSystem.pullFolder(folderName);

      this.eventEmiter.emit('FOLDER_PULLED', folderName, this.fileSystem.kind);
    };

    const tasks = queuesByLevel.map(
      (folders: Array<string>, level: number) => async (): Promise<void> => {
        try {
          await async.mapLimit(
            folders,
            PullFolderQueueConsumer.MAX_CALLS_PER_LEVEL,
            pullFolder
          );
        } catch (err: unknown) {
          return Promise.reject(
            new Error(
              `An error occured creating a folder of the level: ${level}`
            )
          );
        }
      }
    );

    await async.series<unknown, unknown, unknown>(tasks).catch(Logger.error);
  }
}