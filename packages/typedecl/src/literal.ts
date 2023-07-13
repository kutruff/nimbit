import { _type, fail, pass, Typ, type Literal, type ParseResult } from '.';

export class LiteralType<TLiteralValue, TInput = TLiteralValue> extends Typ<'literal', TLiteralValue, TInput> {
  constructor(public literal: TLiteralValue, public name?: string) {
    super('literal', name);
  }
  _withInput<TNewInput>(): LiteralType<TLiteralValue, TNewInput> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return undefined as any;
  }

  parse(value: TInput): ParseResult<TLiteralValue> {
    //does not handle new String() on purpose.
    return (value as unknown) === this.literal ? pass(this.literal) : fail();
  }
}

export function literal<T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>) {
  return new LiteralType(literalValue);
}
