import { LocalContents } from './LocalContents';

type ResultFilePath = string;

export interface LocalFileSystem {
  write(contents: LocalContents, name?: string): Promise<ResultFilePath>;

  remove(path: string): Promise<void>;

  exists(path: string): Promise<boolean>;

  contents: (path: string) => Promise<{
    contents: LocalContents;
    abortSignal: AbortSignal;
  }>;
}
