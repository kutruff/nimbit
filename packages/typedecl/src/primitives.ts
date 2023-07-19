/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, pass, Typ, type ParseResult } from '.';

export const nul = createType('null', (value: null) => (value === null ? pass(value) : fail()));
export const undef = createType('undefined', (value: undefined) => (value === undefined ? pass(value) : fail()));
export const any = createType('any', (value: any) => pass(value));
export const unknown = createType('unknown', (value: unknown) => pass(value));
export const string = createType('string', (value: string) => (typeof value === 'string' ? pass(value) : fail()));
export const number = createType('number', (value: number) => (typeof value === 'number' ? pass(value) : fail()));
export const boolean = createType('boolean', (value: boolean) => (typeof value === 'boolean' ? pass(value) : fail()));
export const bigint = createType('bigint', (value: bigint) => (typeof value === 'bigint' ? pass(value) : fail()));
export const date = createType('date', (value: Date) =>
  value instanceof Date && !isNaN(value.getTime()) ? pass(value) : fail()
);

export const never = new Typ<'never', never, never>('never', undefined as never, 'never');

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
