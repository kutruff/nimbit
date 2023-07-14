import { _type, fail, pass, Typ, type Literal, type ParseResult, type Type } from '.';

export class LiteralType<TLiteralValue> extends Typ<'literal', TLiteralValue> {
  constructor(public literal: TLiteralValue, name?: string) {
    super('literal', name);
  }

  parse(value: TLiteralValue): ParseResult<TLiteralValue> {
    //does not handle new String() on purpose.
    return (value as unknown) === this.literal ? pass(this.literal) : fail();
  }

  areEqual(other: Type<unknown, unknown>): boolean {
    return this.literal === (other as LiteralType<TLiteralValue>).literal;
  }
}

export function literal<T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>) {
  return new LiteralType(literalValue);
}
