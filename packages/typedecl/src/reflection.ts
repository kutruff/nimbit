export type StringKeys<T extends object> = Extract<keyof T, string>;
export const getKeys = <T extends object>(obj: T) => Object.keys(obj) as StringKeys<T>[];

export const keyMap = <T extends object>(type: T) =>
  getKeys(type).reduce((acc, x) => ({ ...acc, [x]: x }), {}) as ObjectKeyMap<T>;

export type ObjectKeyMap<T> = { [K in keyof T]: K };

export type TupleKeysToUnion<T extends readonly unknown[], Acc = never> = T extends readonly [infer U, ...infer TRest]
  ? TupleKeysToUnion<TRest, Acc | U>
  : Acc;

export type MapOfTupleKeys<T extends readonly unknown[]> = { [K in Extract<TupleKeysToUnion<T>, PropertyKey>]: K };

export function createMapOfTupleKeys<TTuple extends readonly [TValue, ...TValue[]], TValue extends PropertyKey>(
  tuple: TTuple
): MapOfTupleKeys<TTuple> {
  return tuple.reduce((acc, cur) => ({ ...acc, [cur]: cur }), {} as MapOfTupleKeys<TTuple>);
}
