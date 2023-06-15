export type StringKeys<T extends object> = Extract<keyof T, string>;
export const getKeys = <T extends object>(obj: T) => Object.keys(obj) as StringKeys<T>[];

export const keyMap = <T extends object>(type: T) =>
  getKeys(type).reduce((acc, x) => ({ ...acc, [x]: x }), {}) as ObjectKeyMap<T>;

export type ObjectKeyMap<T> = { [K in keyof T]: K };
