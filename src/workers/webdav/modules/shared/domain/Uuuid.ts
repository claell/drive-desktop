import * as uuid from 'uuid';
import { InvalidArgumentError } from '../../../../shared/domain/InvalidArgumentError';
import { ValueObject } from '../../../../shared/domain/ValueObject';

export class Uuid extends ValueObject<string> {
  constructor(value: string) {
    super(value);
    this.ensureIsValidUuid(value);
  }

  static random(): Uuid {
    return new Uuid(uuid.v4());
  }

  private ensureIsValidUuid(id: string): void {
    if (!uuid.validate(id)) {
      throw new InvalidArgumentError(
        `<${this.constructor.name}> does not allow the value <${id}>`
      );
    }
  }
}
