/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { areEqual, fail, pass, Typ, type ComparisonCache, type ParseResult, type TsType, type Type } from '.';

export function set<TValue extends Type<unknown, unknown>>(value: TValue) {
  return new SetType<TValue, Set<TsType<TValue>>, Set<TsType<TValue>>>(value);
}

export class SetType<TValue, T, TInput = T> extends Typ<'set', T, TInput> {
  constructor(public value: TValue, name?: string) {
    super('set', name);
  }

  parse(value: TInput, opts = Typ.defaultOpts): ParseResult<T> {
    if (!(value instanceof Set)) {
      return fail();
    }
    const input = value as Set<unknown>;
    const parsed = new Set();
    for (const element of input) {
      const result = (this.value as any).parse(element, opts);
      if (!result.success) {
        return fail();
      }
      parsed.add(result.value);
    }
    return pass(parsed as T);
  }

  areEqual(other: Type<unknown, unknown>, cache: ComparisonCache): boolean {
    return areEqual(
      this.value as Type<unknown, unknown>,
      (other as SetType<unknown, unknown, unknown>).value as Type<unknown, unknown>,
      cache
    );
  }
}
