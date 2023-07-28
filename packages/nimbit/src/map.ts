import {
  fail,
  failWrongType,
  pass,
  recordIfFailed,
  Typ,
  type ArrayErrorIndex,
  type ParseResult,
  type TsType,
  type Type
} from '.';

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

  safeParse(value: unknown): ParseResult<T> {
    if (!(value instanceof Map)) {
      return failWrongType(this.kind, value);
    }

    const keyErrors: ArrayErrorIndex = [];
    const valueErrors: ArrayErrorIndex = [];

    const result = new Map();
    let i = 0;
    for (const [key, elementValue] of value) {
      const keyResult = (this.shape[0] as Typ).safeParse(key);
      recordIfFailed(keyErrors, i, keyResult);

      const valueResult = (this.shape[1] as Typ).safeParse(elementValue);
      recordIfFailed(valueErrors, i, valueResult);

      if (keyResult.success && valueResult.success) {
        result.set(keyResult.data, valueResult.data);
      }
      i++;
    }
    return keyErrors.length === 0 && valueErrors.length === 0
      ? pass(result as T)
      : fail({ kind: 'map', keyErrors, valueErrors });
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   const otherMap = other as MapType<unknown, unknown, unknown>;
  //   return (
  //     areEqual(this.key as Typ, otherMap.key as Typ, cache) && areEqual(this.value as Typ, otherMap.value as Typ, cache)
  //   );
  // }
}
