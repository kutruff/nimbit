import {
  fail,
  failInvalidType,
  pass,
  recordIfFailed,
  Typ,
  type ArrayErrorIndex,
  type ParseResult,
  type TsType,
  type Type
} from '.';

export function set<TValue extends Type<unknown, unknown>>(value: TValue, name?: string) {
  return new SetType<TValue, Set<TsType<TValue>>>(value, name);
}

export class SetType<TValue, T> extends Typ<'set', TValue, T> {
  constructor(public value: TValue, name?: string) {
    super('set', value, name);
  }

  safeParse(value: unknown): ParseResult<T> {
    if (!(value instanceof Set)) {
      return failInvalidType(this.kind, value);
    }

    const parsed = new Set();
    let i = 0;
    const errors: ArrayErrorIndex = [];
    for (const element of value) {
      const result = (this.value as Typ).safeParse(element);
      if (result.success) {
        parsed.add(result.data);
      }
      recordIfFailed(errors, i, result);
      i++;
    }

    return errors.length === 0 ? pass(parsed as T) : fail({ kind: 'set', errors });
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   return areEqual(this.value as Typ, (other as SetType<unknown, unknown>).value as Typ, cache);
  // }
}
