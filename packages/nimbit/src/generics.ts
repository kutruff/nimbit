/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Constructor = new (...args: unknown[]) => {};

export type UndefinedProps<T extends object> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

// Combine with rest of the required properties
// https://stackoverflow.com/a/75587790
export type MakeUndefinedOptional<T> = T extends object ? UndefinedProps<T> & Omit<T, keyof UndefinedProps<T>> : T;

// https://stackoverflow.com/a/50375286
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type NotAUnion<T> = [T] extends [boolean] ? boolean : [T] extends [UnionToIntersection<T>] ? T : never;

//ahejlsberg FTW: https://github.com/microsoft/TypeScript/issues/42644#issuecomment-774315112
export type Literal<T, LiteralValue> = LiteralValue extends T ? (T extends LiteralValue ? never : LiteralValue) : never;

//TODO: is the constraint needed?
export type ElementType<T extends Array<unknown>> = T extends Array<infer TElement> ? TElement : never;

export type Writeable<T> = {
  -readonly [P in keyof T]: Writeable<T[P]>;
};

export type IsLengthOneTuple<T> = T extends []
  ? never
  : T extends [infer _Head, infer _Tail, ...infer _Rest]
  ? never
  : T extends [infer Head]
  ? Head
  : never;

export type TupleValuesToUnion<T extends readonly unknown[], Acc = never> = T extends readonly [infer U, ...infer TRest]
  ? TupleValuesToUnion<TRest, Acc | U>
  : Acc;

//This and other things taken from Zod.
export type Identity<T> = T;
export type Resolve<T> = T extends
  | Map<unknown, unknown>
  | Set<unknown>
  | Date
  | Array<unknown>
  | string
  | number
  | bigint
  | boolean
  ? T
  : { [K in keyof T]: T[K] };

// //simplifies a type.  All the primitives are added to avoid intersection types like {a: number} & string
// export type Resolve<T> = T extends
//   | Map<unknown, unknown>
//   | Set<unknown>
//   | Date
//   | Array<unknown>
//   | string
//   | number
//   | bigint
//   | boolean
//   ? T
//   : T extends object
//   ? {} & { [P in keyof T]: Resolve<T[P]> }
//   : T;
