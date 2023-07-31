import { InvalidArgumentError } from '../../../../shared/domain/InvalidArgumentError';
import { ValueObject } from '../../../../shared/domain/ValueObject';

export class ContentsId extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.ensureIsValid(value);
  }

  ensureIsValid(value: string) {
    if (value.length !== 24) {
      throw new InvalidArgumentError(
        'The content ID needs to be 24 characters in length'
      );
    }
  }
}
