import { nul, undef, union, type Constructor, type MakeUndefinedOptional, type ObjType, type Resolve } from '.';

//Need this symbol / property definition so that type inference will actual use the T parameter during type inference
//https://github.com/Microsoft/TypeScript/issues/29657#issuecomment-460728148
export const _type: unique symbol = Symbol('type');

export interface Type<TKind = unknown, T = unknown> {
  //This property is never used. By having a hidden/optional and practically usettable property, TS will use the T parameter during type inference.
  [_type]: T;
  kind: TKind;
  //TODO: Should the name be an array and support namespaces?
  name?: string;
}
export interface Shape {
  [key: string]: Type<unknown, unknown>;
}

export type ShapeDefinition =
  | {
      [key: string]: Type<unknown, unknown>;
    }
  | Constructor;

export type ToTsTypes<T> = T extends Type<unknown, unknown>
  ? T[typeof _type]
  : {
      [P in keyof T]: ToTsTypes<T[P]>;
    };

export type ShapeDefinitionToObjType<T> = T extends Constructor
  ? ObjType<Required<InstanceType<T>>, ToTsTypes<InstanceType<T>>>
  : ObjType<T, MakeUndefinedOptional<ToTsTypes<T>>>;

export type TsType<T extends Type<unknown, unknown>> = T[typeof _type];
export type Infer<T extends Type<unknown, unknown>> = Resolve<T[typeof _type]>;

export class Typ<TKind = unknown, T = unknown> implements Type<TKind, T> {
  [_type]!: T;
  constructor(public kind: TKind, public name?: string) {}
  opt() {
    //TODO: switch optional to be a union of undefined and the type
    return union(this, undef);
  }

  optN() {
    return union(this, undef, nul);
  }

  ro() {
    return this;
  }

  optRo() {
    return union(this, undef);
  }

  nullable() {
    return union(this, nul);
  }

  nullish() {
    return union(this, undef, nul);
  }

  parse(_value: unknown): ParseResult<unknown> {
    return { success: false };
  }
}

export type ParseResult<T> = { success: true; value: T } | { success: false };

//TODO: remove
export const createType = <TKind, T>(kind: TKind, name: string) => new Typ<TKind, T>(kind, name);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const any = createType<'any', any>('any', 'any');
export type AnyType = typeof any;

//Required for type inference of the return type for the union() function
export interface IUnionType<TMembers extends Type<unknown, unknown>> extends Type<'union', unknown> {
  memberTypes: TMembers[];
}

export type FlattenedUnion<T> = T extends IUnionType<infer K> ? FlattenedUnion<K> : T;

export type InferTupleKeys<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [
  infer U,
  ...infer TRest
]
  ? U extends Type<unknown, unknown>
    ? InferTupleKeys<TRest, [...Acc, TsType<U>]>
    : Acc
  : Acc;
