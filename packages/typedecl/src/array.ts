/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Typ, type ParseResult, type TsType, type Type } from '.';

export function array<TElement extends Type<unknown, unknown>>(
  element: TElement
): ArrayType<TElement, Array<TsType<TElement>>> {
  return new ArrayType<TElement, Array<TsType<TElement>>>(element);
}

export class ArrayType<TElement, T> extends Typ<'array', T> {
  constructor(public elementType: TElement, public name?: string) {
    super('array', name);
  }

  parse(value: unknown): ParseResult<Array<T>> {
    if (!Array.isArray(value)) {
      return { success: false };
    }
    const valueAsArray = value as unknown[];
    const parsedArray = [];
    for (const element of valueAsArray) {
      const result = (this.elementType as any).parse(element);
      if (!result.success) {
        return { success: false };
      }
      parsedArray.push(result.value);
    }
    return { success: true, value: parsedArray };
  }
}
