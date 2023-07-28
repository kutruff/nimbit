/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type TupleValuesToUnion } from '.';

export type ObjectKeys<T extends object> = Extract<keyof T, string | symbol>;
export type ObjectKeyMap<T> = { [K in keyof T]: K };

export function getKeys<T extends object>(obj: T): ObjectKeys<T>[] {
  return Reflect.ownKeys(obj) as any;
}

export function keyMap<T extends object>(type: T): ObjectKeyMap<T> {
  return getKeys(type).reduce((acc, x) => ({ ...acc, [x]: x }), {}) as any;
}

export const EVIL_PROTO = '__proto__';

export type MapOfTupleKeys<T extends readonly unknown[]> = { [K in Extract<TupleValuesToUnion<T>, PropertyKey>]: K };

export function createMapOfTupleKeys<TTuple extends readonly [TValue, ...TValue[]], TValue extends PropertyKey>(
  tuple: TTuple
): MapOfTupleKeys<TTuple> {
  return tuple.reduce((acc, cur) => ({ ...acc, [cur]: cur }), {} as MapOfTupleKeys<TTuple>);
}

//unfortunately typescript tuples with as const always end up readonly which isn't always what we want.
export const asTuple = <T extends unknown[]>(...args: T): T => args;

//TODO: may want to add middleware here to allow for custom types
export function isBasicObject(value: unknown): value is object {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Map) &&
    !(value instanceof Set)
  );
}
