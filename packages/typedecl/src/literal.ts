import { _type, Typ, type Literal, type ParseResult } from '.';

export class LiteralType<TLiteralValue> extends Typ<'literal', TLiteralValue> {
  constructor(public literal: TLiteralValue, public name?: string) {
    super('literal', name);
  }

  parse(value: unknown): ParseResult<TLiteralValue> {
    //does not handle new String() on purpose.
    return value === this.literal ? { success: true, value: this.literal } : { success: false };
  }
}

export function literal<T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>) {
  return new LiteralType(literalValue);
}
