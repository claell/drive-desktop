import { Writable, pipeline } from 'stream';
import { LocalContents } from '../../../local-drive/contents/domain/LocalContents';
import { promisify } from 'util';
const promisifiedPipeline = promisify(pipeline);

export class ReadLocalFileContentsToBuffer {
  static async run(contents: LocalContents): Promise<Buffer> {
    const bufferArray: any[] = [];

    const bufferWritter = new Writable({
      write: (chunk, _, callback) => {
        bufferArray.push(chunk);
        callback();
      },
    });

    await promisifiedPipeline(contents.stream, bufferWritter);

    const buffer = Buffer.concat(bufferArray);

    return buffer;
  }
}
