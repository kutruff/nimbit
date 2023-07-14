/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { areEqual, fail, pass, Typ, type ComparisonCache, type ParseResult, type TsType, type Type } from '.';

export function map<TKey extends Type<unknown, unknown>, TValue extends Type<unknown, unknown>>(
  key: TKey,
  value: TValue
) {
  return new MapType<TKey, TValue, Map<TsType<TKey>, TsType<TValue>>, Map<TsType<TKey>, TsType<TValue>>>(key, value);
}

export class MapType<TKey, TValue, T, TInput = T> extends Typ<'map', T, TInput> {
  constructor(public key: TKey, public value: TValue, public name?: string) {
    super('map', name);
  }

  parse(value: TInput, opts = Typ.defaultOpts): ParseResult<T> {
    if (!(value instanceof Map)) {
      return fail();
    }

    const valueAsMap = value as Map<unknown, unknown>;
    const parsedMap = new Map();
    for (const [key, value] of valueAsMap) {
      const keyResult = (this.key as any).parse(key, opts);
      if (!keyResult.success) {
        return fail();
      }
      const valueResult = (this.value as any).parse(value, opts);
      if (!keyResult.success) {
        return fail();
      }
      parsedMap.set(keyResult.value, valueResult.value);
    }
    return pass(parsedMap as T);
  }

  areEqual(other: Type<unknown, unknown>, cache: ComparisonCache): boolean {
    const otherMap = other as MapType<unknown, unknown, unknown, unknown>;
    return (
      areEqual(this.value as Type<unknown, unknown>, otherMap.value as Type<unknown, unknown>, cache) &&
      areEqual(this.key as Type<unknown, unknown>, otherMap.key as Type<unknown, unknown>, cache)
    );
  }
}
