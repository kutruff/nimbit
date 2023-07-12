/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Typ, type ParseResult, type TsType, type Type } from '.';

export function array<TElement extends Type<unknown, unknown>>(
  element: TElement
): ArrayType<TElement, Array<TsType<TElement>>, Array<TsType<TElement>>> {
  return new ArrayType<TElement, Array<TsType<TElement>>, Array<TsType<TElement>>>(element);
}

export class ArrayType<TElement, T, TInput = unknown> extends Typ<'array', T, TInput> {
  constructor(public elementType: TElement, public name?: string) {
    super('array', name);
  }

  _withInput<TNewInput>(): ArrayType<TElement, T, TNewInput> {
    return undefined as any;
  }

  parse(value: TInput): ParseResult<T> {
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
    return { success: true, value: parsedArray as T };
  }
}
