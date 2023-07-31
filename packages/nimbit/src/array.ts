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

export function array<TValue extends Type<unknown, unknown>>(value: TValue) {
  return new ArrayType<TValue, Array<TsType<TValue>>>(value);
}

export class ArrayType<TValue, T> extends Typ<'array', TValue, T> {
  constructor(public element: TValue, name?: string) {
    super('array', element, name);
  }

  safeParse(value: unknown): ParseResult<T> {
    if (!Array.isArray(value)) {
      return failInvalidType(this.kind, value);
    }
    const parsed = [];
    const errors: ArrayErrorIndex = [];

    for (let i = 0; i < value.length; i++) {
      const result = (this.shape as Typ).safeParse(value[i]);

      if (result.success) {
        parsed.push(result.data);
      }
      recordIfFailed(errors, i, result);
    }

    return errors.length === 0 ? pass(parsed as T) : fail({ kind: 'array', errors });
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   return areEqual(this.shape as Typ, other.shape as Typ, cache);
  // }
}
