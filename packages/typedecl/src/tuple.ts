/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { fail, pass, Typ, type ParseResult, type TsType, type Type } from '.';

export type InferTupleKeys<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [
  infer U,
  ...infer TRest
]
  ? U extends Type<unknown, unknown>
    ? InferTupleKeys<TRest, [...Acc, TsType<U>]>
    : Acc
  : Acc;

export class TupleType<
  TElements extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]],
  TInput = InferTupleKeys<TElements>
> extends Typ<'tuple', InferTupleKeys<TElements>, TInput> {
  constructor(public elementTypes: TElements, public name?: string) {
    super('tuple', name);
  }

  parse(value: TInput, opts = Typ.defaultOpts): ParseResult<InferTupleKeys<TElements>> {
    if (!Array.isArray(value) || value.length !== this.elementTypes.length) {
      return fail();
    }
    const valueAsArray = value as unknown[];
    const parsedTuple = [];
    parsedTuple.length = this.elementTypes.length;

    for (let i = 0; i < this.elementTypes.length; i++) {
      const result = (this.elementTypes[i] as any).parse(valueAsArray[i]);

      if (!result.success) {
        return fail();
      }
      parsedTuple[i] = result.value;
    }

    return pass(parsedTuple as any);
  }
}

export function tuple<TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(values: TTuple) {
  return new TupleType(values);
}
