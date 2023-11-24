import { VirtualDrive } from 'virtual-drive/dist';
import { VirtualFileSystem } from '../domain/VirtualFileSystem';
import { RelativePathToAbsoluteConverter } from '../../../drive/shared/application/RelativePathToAbsoluteConverter';
import fs from 'fs/promises';
import { VirtualFile } from '../domain/VirtualFile';

export class NodeWinLocalFileSystem implements VirtualFileSystem {
  constructor(
    private readonly virtualDrive: VirtualDrive,
    private readonly relativePathToAbsoluteConverter: RelativePathToAbsoluteConverter
  ) {}

  async getLocalFileId(file: VirtualFile): Promise<`${string}-${string}`> {
    const win32AbsolutePath = this.relativePathToAbsoluteConverter.run(
      file.path
    );

    const { ino, dev } = await fs.stat(win32AbsolutePath);

    return `${dev}-${ino}`;
  }

  async createPlaceHolder(file: VirtualFile): Promise<void> {
    this.virtualDrive.createFileByPath(
      file.path,
      file.id,
      file.size,
      file.createdAt,
      file.updatedAt
    );
  }

  async exists(file: VirtualFile): Promise<boolean> {
    try {
      await fs.stat(file.path);
      return true;
    } catch {
      return false;
    }
  }

  async rename(previousPath: string, path: string): Promise<void> {
    const win32AbsolutePath =
      this.relativePathToAbsoluteConverter.run(previousPath);
    const newWin32AbsolutePath = this.relativePathToAbsoluteConverter.run(path);

    await fs.rename(win32AbsolutePath, newWin32AbsolutePath);
  }

  async delete(path: string): Promise<void> {
    const win32AbsolutePath = this.relativePathToAbsoluteConverter.run(path);

    await fs.unlink(win32AbsolutePath);
  }
}
