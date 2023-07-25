/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { areEqual, fail, pass, Typ, type ComparisonCache, type ParseResult, type TsType, type Type } from '.';

export function array<TValue extends Type<unknown, unknown>>(value: TValue) {
  return new ArrayType<TValue, Array<TsType<TValue>>>(value);
}

export class ArrayType<TValue, T> extends Typ<'array', TValue, T> {
  constructor(public element: TValue, name?: string) {
    super('array', element, name);
  }

  parse(value: unknown, opts = Typ.defaultOpts): ParseResult<T> {
    if (!Array.isArray(value)) {
      return fail();
    }
    const valueAsArray = value as unknown[];
    const parsedArray = [];
    for (const element of valueAsArray) {
      const result = (this.shape as any).parse(element, opts);
      if (!result.success) {
        return fail();
      }
      parsedArray.push(result.value);
    }
    return pass(parsedArray as T);
  }

  areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
    return areEqual(this.shape as Typ, other.shape as Typ, cache);
  }
}
