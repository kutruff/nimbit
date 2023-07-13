/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fail, pass, Typ, type ParseResult, type TsType, type Type } from '.';

export function array<TElement extends Type<unknown, unknown>>(element: TElement) {
  return new ArrayType<TElement, Array<TsType<TElement>>, Array<TsType<TElement>>>(element);
}

export class ArrayType<TElement, T, TInput = T> extends Typ<'array', T, TInput> {
  constructor(public elementType: TElement, public name?: string) {
    super('array', name);
  }

  parse(value: TInput, opts = Typ.defaultOpts): ParseResult<T> {
    if (!Array.isArray(value)) {
      return fail();
    }
    const valueAsArray = value as unknown[];
    const parsedArray = [];
    for (const element of valueAsArray) {
      const result = (this.elementType as any).parse(element, opts);
      if (!result.success) {
        return fail();
      }
      parsedArray.push(result.value);
    }
    return pass(parsedArray as T);
  }
}
