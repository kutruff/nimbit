/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Typ, type InferTupleKeys, type ParseResult, type Type } from '.';

export class TupleType<TElements extends Type<unknown, unknown>[]> extends Typ<'tuple', unknown> {
  constructor(public elementTypes: TElements, public name?: string) {
    super('tuple', name);
  }
  parse(value: unknown): ParseResult<InferTupleKeys<TElements, []>> {
    if (!Array.isArray(value)) {
      return { success: false };
    }
    const valueAsArray = value as unknown[];
    const parsedTuple = [];
    parsedTuple.length = this.elementTypes.length;
    if (valueAsArray.length === this.elementTypes.length) {
      for (let i = 0; i < this.elementTypes.length; i++) {
        const result = (this.elementTypes[i] as any).parse(valueAsArray[i]);
        if (!result.success) {
          return { success: false };
        }
        parsedTuple[i] = result.value;
      }
    }

    return { success: true, value: parsedTuple as any };
  }
}

export function tuple<TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(values: TTuple) {
  return new TupleType(values);
}
