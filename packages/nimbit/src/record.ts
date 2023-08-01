/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  EVIL_PROTO,
  fail,
  failInvalidType,
  isBasicObject,
  pass,
  recordIfFailed,
  Typ,
  type ArrayErrorIndex,
  type NumberT,
  type ParseResult,
  type StringT,
  type SymbolT,
  type TsType
} from '.';

export function record<TKey extends StringT | NumberT | SymbolT, TValue extends Typ<unknown, unknown>>(
  key: TKey,
  value: TValue,
  name?: string
) {
  return new RecordType<TKey, TValue, Record<TsType<TKey>, TsType<TValue>>>(key, value, name);
}

//TODO: is having key and value as extra properties okay for things like intersection and other operators? Will TS handle them correctly?
export class RecordType<TKey, TValue, T> extends Typ<'record', [TKey, TValue], T> {
  constructor(public key: TKey, public value: TValue, name?: string) {
    super('record', [key, value], name);
  }

  safeParse(value: unknown): ParseResult<T> {
    if (!isBasicObject(value) || Object.hasOwn(value, EVIL_PROTO)) {
      return failInvalidType(this.kind, value);
    }

    const parsed = {} as any;

    const keyErrors: ArrayErrorIndex = [];
    const valueErrors: ArrayErrorIndex = [];
    let i = 0;
    for (const key of Reflect.ownKeys(value)) {
      const keyResult = (this.key as Typ).safeParse(key);
      recordIfFailed(keyErrors, i, keyResult);

      const valueResult = (this.value as Typ).safeParse((value as any)[key]);
      recordIfFailed(valueErrors, i, valueResult);

      if (keyResult.success && valueResult.success) {
        parsed[keyResult.data as PropertyKey] = valueResult.data;
      }
      i++;
    }
    return keyErrors.length === 0 && valueErrors.length === 0
      ? pass(parsed)
      : fail({ kind: 'record', keyErrors, valueErrors });
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   const otherRecord = other as RecordType<unknown, unknown, unknown>;
  //   return (
  //     areEqual(this.key as Typ, otherRecord.key as Typ, cache) &&
  //     areEqual(this.value as Typ, otherRecord.value as Typ, cache)
  //   );
  // }
}
