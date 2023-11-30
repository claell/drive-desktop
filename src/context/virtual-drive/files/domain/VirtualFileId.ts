import { ValueObject } from '../../../shared/domain/ValueObject';

export type FilePlaceholderIdPrefixType = 'FILE:';
export const FilePlaceholderIdPrefix = 'FILE:';

export type FilePlaceholderId = `${FilePlaceholderIdPrefixType}${string}`;

function typedCheck(
  input: string,
  prefix: FilePlaceholderIdPrefixType = 'FILE:'
): input is FilePlaceholderId {
  return input.startsWith(prefix);
}
export function isFilePlaceholderId(input: string): input is FilePlaceholderId {
  return typedCheck(input);
}

function typedCreate(
  id: string,
  prefix: FilePlaceholderIdPrefixType = 'FILE:'
): FilePlaceholderId {
  return (prefix + id) as FilePlaceholderId;
}

export function createFilePlaceholderId(id: string): FilePlaceholderId {
  return typedCreate(id);
}

export class VirtualFileId extends ValueObject<FilePlaceholderId> {
  private static readonly PREFIX = 'FILE:';

  constructor(value: FilePlaceholderId) {
    super(value);
  }

  static fromContentsId(id: string): VirtualFileId {
    const value = `${VirtualFileId.PREFIX}${id}` as const;

    return new VirtualFileId(value);
  }
}
