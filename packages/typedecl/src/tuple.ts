/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { areEqual, fail, pass, Typ, type ComparisonCache, type ParseResult, type TsType, type Type } from '.';

export type InferTupleKeys<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [
  infer U,
  ...infer TRest
]
  ? U extends Type<unknown, unknown>
    ? InferTupleKeys<TRest, [...Acc, TsType<U>]>
    : Acc
  : Acc;

export class TupleType<TElements extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]> extends Typ<
  'tuple',
  InferTupleKeys<TElements>
> {
  constructor(public elementTypes: TElements, name?: string) {
    super('tuple', name);
  }

  parse(value: InferTupleKeys<TElements>, opts = Typ.defaultOpts): ParseResult<InferTupleKeys<TElements>> {
    if (!Array.isArray(value) || value.length !== this.elementTypes.length) {
      return fail();
    }
    const valueAsArray = value as unknown[];
    const parsedTuple = [];
    parsedTuple.length = this.elementTypes.length;

    for (let i = 0; i < this.elementTypes.length; i++) {
      const result = (this.elementTypes[i] as any).parse(valueAsArray[i], opts);

      if (!result.success) {
        return fail();
      }
      parsedTuple[i] = result.value;
    }

    return pass(parsedTuple as any);
  }

  areEqual(other: Type<unknown, unknown>, cache: ComparisonCache): boolean {
    const elements = this.elementTypes as unknown as Typ<unknown, unknown>[];
    const otherElements = (other as typeof this).elementTypes;

    if (elements.length !== otherElements.length) {
      return false;
    }

    for (let i = 0; i < elements.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!areEqual(elements[i]!, otherElements[i]!, cache)) {
        return false;
      }
    }
    return true;
  }
}

export function tuple<TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(values: TTuple) {
  return new TupleType(values);
}
