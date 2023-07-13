/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fail, pass, Typ, type ParseResult, type TsType, type Type } from '.';

export function array<TValue extends Type<unknown, unknown>>(value: TValue) {
  return new ArrayType<TValue, Array<TsType<TValue>>, Array<TsType<TValue>>>(value);
}

export class ArrayType<TElement, T, TInput = T> extends Typ<'array', T, TInput> {
  constructor(public value: TElement, public name?: string) {
    super('array', name);
  }

  parse(value: TInput, opts = Typ.defaultOpts): ParseResult<T> {
    if (!Array.isArray(value)) {
      return fail();
    }
    const valueAsArray = value as unknown[];
    const parsedArray = [];
    for (const element of valueAsArray) {
      const result = (this.value as any).parse(element, opts);
      if (!result.success) {
        return fail();
      }
      parsedArray.push(result.value);
    }
    return pass(parsedArray as T);
  }
}
