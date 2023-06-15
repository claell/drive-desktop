import { Environment } from '@internxt/inxt-js';
import { Readable } from 'stream';
import { EnvironmentFileContentRepository } from '../../../../files/infrastructure/storage/EnvironmentFileContentRepository';
import { WebdavFileMother } from '../../domain/WebdavFileMother';

describe.skip('Environment File Content Repository', () => {
  const environment = new Environment({
    bridgeUrl: 'http://faetzat.co/mup',
    bridgeUser: '0c96be4b-a25d-5cfa-8ec6-096a5bd862b6',
    bridgePass: 'ad566601-3d04-59fa-9441-05ec9eaf0849',
    encryptionKey:
      'Bill Hunt Sally Reed Bobby Powell Willie Johnson Ethan Christensen Lawrence Washington',
  });
  const bucket = '34a3023d-aaed-5b85-9abc-3c6b22076670';

  let reposiotry: EnvironmentFileContentRepository;
  let mockDownload: jest.Mock;
  let mockUpload: jest.Mock;

  beforeEach(() => {
    reposiotry = new EnvironmentFileContentRepository(environment, bucket);

    mockDownload = jest.fn();
    mockUpload = jest.fn();

    jest.mock('@internxt/inxt-js', () => ({
      // __esModule: true,
      // ...jest.requireActual('third-party-library'),

      download: mockDownload,
      upload: mockUpload,
    }));
  });

  describe('download', () => {
    it('returns a readable with the file contents', async () => {
      const file = WebdavFileMother.any();

      mockDownload.mockImplementationOnce((_bucket, _fileId, cbs) => {
        cbs.finishedCallback(undefined, new Readable());
      });

      const stream = await reposiotry.download(file);

      expect(stream.readable).toBe(true);
    });
  });
});