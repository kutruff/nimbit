/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  fail,
  failInvalidType,
  pass,
  recordIfFailed,
  Typ,
  type ArrayErrorIndex,
  type ParseResult,
  type TsType,
  type Type
} from '.';

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
  TElements,
  InferTupleKeys<TElements>
> {
  constructor(public elements: TElements, name?: string) {
    super('tuple', elements, name);
  }

  safeParse(value: unknown): ParseResult<InferTupleKeys<TElements>> {
    if (!Array.isArray(value) || value.length !== this.elements.length) {
      return failInvalidType(this.kind, value);
    }
    const parsed = [];

    const errors: ArrayErrorIndex = [];
    for (let i = 0; i < this.elements.length; i++) {
      const result = (this.elements[i] as Typ).safeParse(value[i]);

      if (result.success) {
        parsed.push(result.data);
      }
      recordIfFailed(errors, i, result);
    }

    return errors.length === 0 ? pass(parsed as any) : fail({ kind: 'tuple', errors });
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   const elements = this.elementTypes as unknown as Typ<unknown, unknown>[];
  //   const otherElements = (other as typeof this).elementTypes;

  //   if (elements.length !== otherElements.length) {
  //     return false;
  //   }

  //   for (let i = 0; i < elements.length; i++) {
  //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //     if (!areEqual(elements[i]!, otherElements[i]! as Typ, cache)) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }
}

export function tuple<TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(values: TTuple) {
  return new TupleType(values);
}
