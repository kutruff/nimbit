/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { areEqual, fail, pass, Typ, TypOrig, type ComparisonCache, type ParseResult, type TsType, type Type } from '.';

export function arrayOrig<TValue extends Type<unknown, unknown>>(value: TValue) {
  return new ArrayType<TValue, Array<TsType<TValue>>>(value);
}

export class ArrayTypeOrig<TValue, T> extends TypOrig<'array', T> {
  constructor(public value: TValue, name?: string) {
    super('array', name);
  }

  parse(value: T, opts = Typ.defaultOpts): ParseResult<T> {
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

  areEqual(other: Type<unknown, unknown>, cache: ComparisonCache): boolean {
    return areEqual(
      this.value as Type<unknown, unknown> as any,
      (other as ArrayTypeOrig<unknown, unknown>).value as any,
      cache
    );
  }
}

export function array<TValue extends Type<unknown, unknown>>(value: TValue) {
  return new ArrayType<TValue, Array<TsType<TValue>>>(value);
}

export class ArrayType<TValue, T> extends Typ<'array', TValue, T> {
  constructor(value: TValue, name?: string) {
    super('array', value, name);
  }

  parse(value: T, opts = Typ.defaultOpts): ParseResult<T> {
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
