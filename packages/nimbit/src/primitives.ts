/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, pass, Typ, type ParseResult } from '.';

export type NullT = Typ<'null', null, null>;
export const nul: NullT = createType('null', (value: null) => (value === null ? pass(value) : fail()));

export type UndefinedT = Typ<'undefined', undefined, undefined>;
export const undef = createType('undefined', (value: undefined) => (value === undefined ? pass(value) : fail()));

export type AnyT = Typ<'any', any, any>;
export const any: AnyT = createType('any', (value: any) => pass(value));

export type UnknownT = Typ<'unknown', unknown, unknown>;
export const unknown: UnknownT = createType('unknown', (value: unknown) => pass(value));

export type StringT = Typ<'string', string, string>;
export const string: StringT = createType('string', (value: string) =>
  typeof value === 'string' ? pass(value) : fail()
);

export type NumberT = Typ<'number', number, number>;
export const number: NumberT = createType('number', (value: number) =>
  typeof value === 'number' ? pass(value) : fail()
);

export type BooleanT = Typ<'boolean', boolean, boolean>;
export const boolean: BooleanT = createType('boolean', (value: boolean) =>
  typeof value === 'boolean' ? pass(value) : fail()
);

export type BigIntT = Typ<'bigint', bigint, bigint>;
export const bigint: BigIntT = createType('bigint', (value: bigint) =>
  typeof value === 'bigint' ? pass(value) : fail()
);

export type DateT = Typ<'date', Date, Date>;
export const date: DateT = createType('date', (value: Date) =>
  value instanceof Date && !isNaN(value.getTime()) ? pass(value) : fail()
);

export type NeverT = Typ<'never', never, never>;
export const never: NeverT = new Typ<'never', never, never>('never', undefined as never, 'never');

export function createType<TKind extends string, TType>(
  kind: TKind,
  parse: (value: TType) => ParseResult<TType>
): Typ<TKind, TType, TType> {
  const instance = new Typ<TKind, TType, TType>(kind, undefined as TType, kind);
  instance.parse = parse;
  return instance;
}

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
