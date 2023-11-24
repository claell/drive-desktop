import { Storage } from '@internxt/sdk/dist/drive/storage';
import { EncryptionVersion } from '@internxt/sdk/dist/drive/storage/types';
import { Crypt } from '../../shared/domain/Crypt';
import { File, FileAttributes } from '../domain/File';
import { FileStatuses } from '../domain/FileStatus';
import {
  CreateParams,
  RemoteFileSystem,
} from '../domain/file-systems/RemoteFileSystem';
import * as uuid from 'uuid';

export class SDKRemoteFileSystem implements RemoteFileSystem {
  constructor(
    private readonly sdk: Storage,
    private readonly crypt: Crypt,
    private readonly bucket: string
  ) {}

  async create(params: CreateParams): Promise<FileAttributes> {
    const encryptedName = this.crypt.encryptName(
      params.name,
      params.folderId.toString()
    );

    if (!encryptedName) {
      throw new Error('Failed to encrypt name');
    }

    const data = await this.sdk.createFileEntry({
      id: params.contentsId,
      type: params.type,
      size: params.size,
      name: encryptedName,
      plain_name: params.name,
      bucket: this.bucket,
      folder_id: params.folderId,
      encrypt_version: EncryptionVersion.Aes03,
    });

    return {
      ...data,
      contentsId: data.fileId,
      modificationTime: data.updatedAt,
      path: params.path,
      status: FileStatuses.EXISTS,
    };
  }

  async trash(contentsId: string): Promise<void> {
    await this.sdk.addItemsToTrash({
      items: [
        {
          type: 'file',
          id: contentsId,
        },
      ],
    });
  }

  async rename(file: File): Promise<void> {
    await this.sdk.updateFile({
      fileId: file.contentsId,
      bucketId: this.bucket,
      destinationPath: uuid.v4(),
      metadata: {
        itemName: file.name,
      },
    });
  }

  async move(file: File): Promise<void> {
    await this.sdk.moveFile({
      fileId: file.contentsId,
      destination: file.folderId,
      destinationPath: uuid.v4(),
      bucketId: this.bucket,
    });
  }
}
