/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFunc = (...args: unknown[]) => unknown;
export type AnyObject = Record<string, unknown>;
export type AnyArray = readonly unknown[];
export type Constructor = new (...args: unknown[]) => {};

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

export type Primitives = number | string;

export type OptionalPropertyNames<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type RequiredPropertyNames<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type OptionalProperties<T> = Pick<T, OptionalPropertyNames<T>>;
export type RequiredProperties<T> = Pick<T, RequiredPropertyNames<T>>;

//https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
//https://stackoverflow.com/a/52473108/463084
export type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

export type WritablePropertyNames<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>;
}[keyof T];

export type ReadonlyPropertyNames<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { readonly [Q in P]: T[P] }, P, never>;
}[keyof T];

export type ReadonlyProperties<T> = Pick<T, ReadonlyPropertyNames<T>>;
export type WritableProperties<T> = Pick<T, WritablePropertyNames<T>>;

//mad science: https://stackoverflow.com/questions/50639496/is-there-a-way-to-prevent-union-types-in-typescript
//  export type NotAUnion<T, U = T> = U extends any ? ([T] extends [boolean] ? T : [T] extends [U] ? T : never) : never;

// https://stackoverflow.com/a/50375286
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type NotAUnion<T> = [T] extends [boolean] ? boolean : [T] extends [UnionToIntersection<T>] ? T : never;

//ahejlsberg FTW: https://github.com/microsoft/TypeScript/issues/42644#issuecomment-774315112
export type Literal<T, LiteralValue> = LiteralValue extends T ? (T extends LiteralValue ? never : LiteralValue) : never;
export type StringLiteral<T> = Literal<string, T>;
export type NumberLiteral<T> = Literal<number, T>;

export type ElementType<T extends Array<unknown>> = T extends Array<infer TElement> ? TElement : never;

export type Writeable<T> = {
  -readonly [P in keyof T]: Writeable<T[P]>;
};

export type TupleKeysToUnion<T extends readonly unknown[], Acc = never> = T extends readonly [infer U, ...infer TRest]
  ? TupleKeysToUnion<TRest, Acc | U>
  : Acc;

export type MapOfTupleKeys<T extends readonly unknown[]> = { [K in Extract<TupleKeysToUnion<T>, PropertyKey>]: K };

//Supposedly simplifies a type.
export type Resolve<T> = T extends object ? {} & { [P in keyof T]: Resolve<T[P]> } : T;

// How to prevent conditional from being distributed
//https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
//type NoDistribute<T> = [T] extends [T] ? T : never;

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
