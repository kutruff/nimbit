import { _type, fail, pass, Typ, type Literal, type ParseResult, type Type } from '.';

export class LiteralType<TLiteralValue> extends Typ<'literal', TLiteralValue, TLiteralValue> {
  constructor(literal: TLiteralValue, name?: string) {
    super('literal', literal, name);
  }

  parse(value: TLiteralValue): ParseResult<TLiteralValue> {
    //does not handle new String() on purpose.
    return (value as unknown) === this.shape ? pass(this.shape) : fail();
  }

  areEqual(other: Typ<unknown, unknown>): boolean {
    return this.shape === (other as LiteralType<TLiteralValue>).shape;
  }
}

export function literal<T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>) {
  return new LiteralType(literalValue);
}
