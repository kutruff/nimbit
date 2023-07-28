/* eslint-disable @typescript-eslint/no-unused-vars */
import { type ElementType, type Literal, type MakeUndefinedOptional, type TupleValuesToUnion, type Writeable } from '.';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFunc = (...args: unknown[]) => unknown;
export type AnyObject = Record<string, unknown>;
export type AnyArray = readonly unknown[];

export type PropsOfType<T, TPropTypes> = {
  [K in keyof T]: T[K] extends TPropTypes ? K : never;
}[keyof T];

export type PropsNotOfType<T, TPropTypes> = {
  [K in keyof T]: T[K] extends TPropTypes ? never : K;
}[keyof T];

export type PickNonFunctionProperties<T> = PickPropsNotOfType<T, AnyFunc>;

export type PickPropsNotOfType<T, TPropTypes> = Pick<T, PropsNotOfType<T, TPropTypes>>;
export type PickPropsOfType<T, TPropTypes> = Pick<T, PropsOfType<T, TPropTypes>>;

export interface HasPropertiesOfType<PropType> {
  [index: string]: PropType;
}

export type MapPropertiesOfTypeToNewType<T, PropType, NewPropType> = T extends HasPropertiesOfType<PropType>
  ? {
      [P in keyof T]: NewPropType;
    }
  : never;

export type PickAndMapPropertiesOfTypeToNewType<T, PropType, NewPropType> = MapPropertiesOfTypeToNewType<
  PickPropsOfType<T, PropType>,
  PropType,
  NewPropType
>;

//Make only certain properties optional.  It's like a selective partial.
export type PickPartially<T, P extends keyof T> = Omit<T, P> & Partial<Pick<T, P>>;
export type PickReadonly<T, P extends keyof T> = Omit<T, P> & Readonly<Pick<T, P>>;

// TODO: Presently unecessary as we are enforcing all types to infer one level below themselvs.
export type RecursiveMakeUndefinedOptional<T> = T extends ReadonlyArray<infer U>
  ? Array<RecursiveMakeUndefinedOptional<MakeUndefinedOptional<U>>>
  : T extends object
  ? { [P in keyof T]: RecursiveMakeUndefinedOptional<MakeUndefinedOptional<T[P]>> }
  : T;

// TODO: deprecated  by UndefinedProps
export type OptionalPropertyNames<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type RequiredPropertyNames<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type OptionalProperties<T> = Pick<T, OptionalPropertyNames<T>>;
export type RequiredProperties<T> = Pick<T, RequiredPropertyNames<T>>;

// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
// https://stackoverflow.com/a/52473108/463084
export type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

export type WritablePropertyNames<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>;
}[keyof T];

export type ReadonlyPropertyNames<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { readonly [Q in P]: T[P] }, P, never>;
}[keyof T];

export type ReadonlyProperties<T> = Pick<T, ReadonlyPropertyNames<T>>;
export type WritableProperties<T> = Pick<T, WritablePropertyNames<T>>;

export type StringLiteral<T> = Literal<string, T>;
export type NumberLiteral<T> = Literal<number, T>;

// mad science: https://stackoverflow.com/questions/50639496/is-there-a-way-to-prevent-union-types-in-typescript
//Deprecated by current version in generics.
export type NotAUnion<T, U = T> = U extends any ? ([T] extends [boolean] ? T : [T] extends [U] ? T : never) : never;

// How to prevent conditional from being distributed
//https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type NoDistribute<T> = [T] extends [any] ? T : never;

type NoDistributeTest = NoDistribute<ToArray<string | number>>;

type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;

// https://stackoverflow.com/a/71642979
type FlattenDeep<T, A extends readonly unknown[] = []> = [T] extends [[infer F, ...infer R]]
  ? FlattenDeep<R, [F] extends [readonly unknown[]] ? [...A, ...FlattenDeep<F>] : [...A, F]>
  : A;

type TupleToObject<Type extends readonly any[]> = {
  [Key in Type[number]]: Key;
};

export type TupOrArrayElements<T extends readonly unknown[]> = TupleValuesToUnion<T> extends never
  ? ElementType<Writeable<T>>
  : TupleValuesToUnion<T>;

// type TupleToObject2<T> = { [K in keyof T as Exclude<K, keyof any[]>]: T[K] };

// type TupleToObject3<T extends any[]> = Omit<T, keyof any[]>;

// type res = TupleToObject<['hello', 'hello', Typ]>;
// type resa = TupleToObject2<['hello', 'hello', Typ]>;
// type redsa = TupleToObject3<['hello', 'hello', Typ]>;

// type GetChars<S> = GetCharsHelper<S, never>;
// type GetCharsHelper<S, Acc> = S extends `${infer Char}${infer Rest}` ? GetCharsHelper<Rest, Char | Acc> : Acc;

// export type Resolve<S> = ResolveHelper<S, never>;
// type ResolveHelper<T, Acc> = T extends object ? {} & { [P in keyof T]: ResolveHelper<T[P]> } : T;

// The following is a way to have a user defined mapping list of types to types.
// type TTypeListMotha = [[Date, Type<'date', Date>], [Buffer, Type<'buffer', Buffer>]];
// type MapIt<T, TList> = TList extends [infer H, ...infer TRest]
//   ? H extends [infer A extends T, infer TType]
//     ? TType
//     : MapIt<T, TRest>
//   : never;

describe('generics.old', () => {
  it('is only for keeping in tree', () => {
    expect(true).toEqual(true);
  });
});
