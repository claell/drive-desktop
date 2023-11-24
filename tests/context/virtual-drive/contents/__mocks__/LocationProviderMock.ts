import { LocalFileContentsDirectoryProvider } from '../../../../../src/context/drive/shared/domain/LocalFileContentsDirectoryProvider';

export class LocationProviderMock
  implements LocalFileContentsDirectoryProvider
{
  public mock = jest.fn();

  provide = this.mock;
}
