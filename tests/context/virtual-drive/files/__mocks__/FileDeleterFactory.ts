import { FileDeleter } from '../../../../../src/context/drive/files/application/FileDeleter';

export class FileDeleterFactory {
  static deletionSucces(): FileDeleter {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      run: (_id: string) => {
        //no-op
      },
    } as unknown as FileDeleter;
  }
}
