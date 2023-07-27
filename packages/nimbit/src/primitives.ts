/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { coerce, Typ, type ParseResult } from '.';
import { fail, pass } from './parsing';

export type NullT = Typ<'null', null, null>;
// export const nul: NullT = createType('null',  (value: null) => (value === null ? pass(value) : fail()));
export const nul: NullT = createType('null', (value: null) => (value === null ? pass(value) : fail()));

export type UndefinedT = Typ<'undefined', undefined, undefined>;
export const undef: UndefinedT = createType('undefined', (value: undefined) =>
  value === undefined ? pass(value) : fail()
);

export type AnyT = Typ<'any', any, any>;
export const any: AnyT = createType('any', pass);

export type UnknownT = Typ<'unknown', unknown, unknown>;
export const unknown: UnknownT = createType('unknown', pass);

export type StringT = Typ<'string', string, string>;
export const string: StringT = createType('string');

//TODO: test all the coercions
export const asString = coerce(string, (x: unknown) => pass(String(x)));

export type NumberT = Typ<'number', number, number>;
export const number: NumberT = createType('number');

export const asNumber = coerce(number, (x: unknown) => {
  const result = Number(x);
  return !isNaN(result) ? pass(result) : fail();
});

export type BooleanT = Typ<'boolean', boolean, boolean>;
export const boolean: BooleanT = createType('boolean');

export const asBoolean = coerce(boolean, (x: unknown) => pass(Boolean(x)));

export type BigIntT = Typ<'bigint', bigint, bigint>;
export const bigint: BigIntT = createType('bigint');

export const asBigint = coerce(bigint, (x: string | number | bigint | boolean) => {
  try {
    return pass(BigInt(x as any));
  } catch (error) {
    return fail(undefined, error);
  }
});

export type SymbolT = Typ<'symbol', symbol, symbol>;
export const symbol: SymbolT = createType('symbol');

export type DateT = Typ<'date', Date, Date>;
export const date: DateT = createType('date', (value: Date) =>
  value instanceof Date && !isNaN(value.getTime()) ? pass(value) : fail()
);

export const asDate = coerce(date, (x: string | number | Date) => {
  const result = new Date(x);
  return !isNaN(result.getTime()) ? pass(result) : fail();
});

export type NeverT = Typ<'never', never, never>;
export const never: NeverT = new Typ<'never', never, never>('never', undefined as never, 'never');

export function createType<TKind extends string, TType>(
  kind: TKind,
  safeParser?: (value: TType) => ParseResult<TType>
): Typ<TKind, TType, TType> {
  const instance = new Typ<TKind, TType, TType>(kind, undefined as TType, kind);
  instance.safeParse = safeParser || ((value: TType) => (typeof value === kind ? pass(value) : fail()));
  return instance;
}

// class DateEx extends Typ<'date', Date, Date> {

//   min
// }
// //TODO: make sure we're okay with the above. It could also be a class so that the parse is in the prototype could also use a class to
// function createType<TKind extends string, TType>(kind: TKind, parse: (value: TType) => ParseResult<TType>) : Typ<TKind, TType>{
//   const theClass = class extends Typ<TKind, TType> {
//     // Mixins may not declare private/protected properties
//     // however, you can use ES2020 private fields
//     parse(x : TType) { return parse(x)};
//   };
//   //could also try to do this to avoid another depth on the callstack but who knows what it would do to the runtime:
//   theClass.prototype.parse = parse;

//   return new theClass(kind, kind) ;
// }
