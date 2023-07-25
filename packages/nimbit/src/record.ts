/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  areEqual,
  fail,
  pass,
  Typ,
  type ComparisonCache,
  type NumberT,
  type ParseResult,
  type StringT,
  type SymbolT,
  type TsType
} from '.';

export function record<TKey extends StringT | NumberT | SymbolT, TValue extends Typ<unknown, unknown>>(
  key: TKey,
  value: TValue
) {
  return new RecordType<TKey, TValue, Record<TsType<TKey>, TsType<TValue>>>(key, value);
}

//TODO: is having key and value as extra properties okay for things like intersection and other operators? Will TS handle them correctly?
export class RecordType<TKey, TValue, T> extends Typ<'record', [TKey, TValue], T> {
  constructor(public key: TKey, public value: TValue, name?: string) {
    super('record', [key, value], name);
  }

  parse(value: unknown, opts = Typ.defaultOpts): ParseResult<T> {
    if (typeof value !== 'object' || value === null) {
      return fail();
    }

    const result = {} as any;
    for (const key of Reflect.ownKeys(value)) {      
      const keyResult = (this.key as any).parse(key, opts);
      const valueResult = (this.value as any).parse((value as any)[key], opts);
      if (!keyResult.success || !valueResult.success) {
        return fail();
      }
      result[keyResult.value] = valueResult.value;
    }
    return pass(result);
  }

  areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
    const otherRecord = other as RecordType<unknown, unknown, unknown>;
    return (
      areEqual(this.key as Typ, otherRecord.key as Typ, cache) &&
      areEqual(this.value as Typ, otherRecord.value as Typ, cache)
    );
  }
}
