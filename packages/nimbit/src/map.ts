/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { areEqual, fail, pass, Typ, type ComparisonCache, type ParseResult, type TsType, type Type } from '.';

export function map<TKey extends Type<unknown, unknown>, TValue extends Type<unknown, unknown>>(
  key: TKey,
  value: TValue
) {
  return new MapType<TKey, TValue, Map<TsType<TKey>, TsType<TValue>>>(key, value);
}

//TODO: is having key and value as extra properties okay for things like intersection and other operators? Will TS handle them correctly?
export class MapType<TKey, TValue, T> extends Typ<'map', [TKey, TValue], T> {
  constructor(public key: TKey, public value: TValue, name?: string) {
    super('map', [key, value], name);
  }

  parse(value: unknown, opts = Typ.defaultOpts): ParseResult<T> {
    if (!(value instanceof Map)) {
      return fail();
    }

    const valueAsMap = value as Map<unknown, unknown>;
    const parsedMap = new Map();
    for (const [key, value] of valueAsMap) {
      const keyResult = (this.shape[0] as any).parse(key, opts);
      if (!keyResult.success) {
        return fail();
      }
      const valueResult = (this.shape[1] as any).parse(value, opts);
      if (!keyResult.success) {
        return fail();
      }
      parsedMap.set(keyResult.value, valueResult.value);
    }
    return pass(parsedMap as T);
  }

  areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
    const otherMap = other as MapType<unknown, unknown, unknown>;
    return (
      areEqual(this.key as Typ, otherMap.key as Typ, cache) && areEqual(this.value as Typ, otherMap.value as Typ, cache)
    );
  }
}
