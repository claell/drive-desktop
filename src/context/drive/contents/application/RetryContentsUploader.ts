import { LocalContents } from '../../../local-drive/contents/domain/LocalContents';
import { VirtualContents } from '../domain/VirtualContents';
import { ContentsUploader } from './ContentsUploader';
import Logger from 'electron-log';

// TODO: the retry logic should be on the infrastructure layer
// change the uploader factory method to revive a function that returns the needed data
export class RetryContentsUploader {
  private static NUMBER_OF_RETRIES = 2;
  private static MILLISECOND_BETWEEN_TRIES = 1_000;
  private static INITIAL_DELAY = 100;

  constructor(private readonly uploader: ContentsUploader) {}

  async retryUpload(asyncFunction: () => Promise<VirtualContents>) {
    let retryCount = 0;

    while (retryCount <= RetryContentsUploader.NUMBER_OF_RETRIES) {
      try {
        const result = await asyncFunction();
        return result;
      } catch (error: unknown) {
        if (error instanceof Error) {
          Logger.warn(
            `Upload attempt ${retryCount + 1} failed: ${error.message}`
          );
        } else {
          Logger.warn(
            `Upload attempt ${retryCount + 1} failed with an unknown error.`
          );
        }

        await new Promise((resolve) => {
          setTimeout(resolve, RetryContentsUploader.MILLISECOND_BETWEEN_TRIES);
        });

        retryCount++;
      }
    }
    throw new Error(
      `Max retries (${RetryContentsUploader.NUMBER_OF_RETRIES}) reached. Upload still failed.`
    );
  }

  async run(
    contents: LocalContents,
    abortSignal: AbortSignal
  ): Promise<VirtualContents> {
    await new Promise((resolve) => {
      setTimeout(resolve, RetryContentsUploader.INITIAL_DELAY);
    });

    const upload = () => this.uploader.run(contents, abortSignal);

    return this.retryUpload(upload);
  }
}
