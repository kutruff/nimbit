import { _type, failInvalidType, pass, Typ, type Literal, type ParseResult } from '.';

export class LiteralType<TLiteralValue> extends Typ<'literal', TLiteralValue, TLiteralValue> {
  constructor(public value: TLiteralValue, name?: string) {
    super('literal', value, name);
  }

  safeParse(value: unknown): ParseResult<TLiteralValue> {
    //does not handle new String() on purpose.
    return value === this.shape ? pass(this.shape) : failInvalidType(this.kind, value);
  }

  // areEqual(other: Typ<unknown, unknown>): boolean {
  //   return this.shape === (other as LiteralType<TLiteralValue>).shape;
  // }
}

export function literal<T, TLiteralValue>(value: Literal<T, TLiteralValue>) {
  return new LiteralType(value);
}
