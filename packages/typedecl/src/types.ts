/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  nul,
  undef,
  union,
  type Constructor,
  type MakeUndefinedOptional,
  type ObjType,
  type Resolve,
  type TypeConverter
} from '.';

//Need this symbol / property definition so that type inference will actual use the T parameter during type inference
//https://github.com/Microsoft/TypeScript/issues/29657#issuecomment-460728148
export const _type: unique symbol = Symbol('type');

export interface Type<TKind = unknown, T = unknown> {
  //This property is never used. By having a hidden/optional and practically unsettable property, TS will use the T parameter during type inference.
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

export class Typ<TKind = unknown, T = unknown, TInput = unknown> implements Type<TKind, T> {
  [_type]!: T;

  constructor(public kind: TKind, public name?: string) {}
  opt() {
    //TODO: switch optional to be a union of undefined and the type
    return union(this, undef);
  }

  optNul() {
    return union(this, undef, nul);
  }

  nullable() {
    return union(this, nul);
  }

  nullish() {
    return union(this, undef, nul);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(value: TInput): ParseResult<T> {
    return { success: false };
  }

  where(predicate: (value: T) => boolean): typeof this {
    const clone = cloneObject(this);
    const originalParse = clone.parse.bind(clone);
    clone.parse = function (value: TInput) {
      const result = originalParse(value);
      if (result.success && predicate(result.value)) {
        return result;
      }
      return { success: false };
    };
    return clone;
  }

  _withInput<TNewInput>(): Typ<TKind, T, TNewInput> {
    return undefined as any;
  }

  //TODO: benchmark cloning vs using a deep prototype chain that calls super.parse instead
  to<TDestKind, TDest>(
    destination: Typ<TDestKind, TDest, unknown>,
    converter?: TypeConverter<T, TDest>
  ): ReturnType<typeof destination._withInput<TInput>> {
    const clone = cloneObject(destination);
    const destinationParse = clone.parse.bind(clone);
    const source = this;
    clone.parse = function (value: TInput) {
      const sourceResult = source.parse(value);

      if (sourceResult.success) {
        let value;
        if (converter) {
          const convertedResult = converter(sourceResult.value);
          if (convertedResult.success) {
            value = convertedResult.value;
          } else {
            return { success: false };
          }
        } else {
          value = sourceResult.value;
        }

        return destinationParse(value);
      }
      return { success: false };
    };

    return clone as any;
  }
}

export function coerce<TDestKind, TDest, TSourceInput>(
  converter: TypeConverter<TSourceInput, TDest>,
  destination: Typ<TDestKind, TDest, unknown>
): ReturnType<typeof destination._withInput<TSourceInput>> {
  const clone = cloneObject(destination);
  const originalParse = clone.parse.bind(clone);

  clone.parse = function (value: TSourceInput) {
    const lastResult = converter(value);

    if (lastResult.success) {
      return originalParse(lastResult.value);
    }
    return fail();
  };
  return clone;
}

//TODO: audit for any form of of prototype poisoning.
function cloneObject<T>(obj: T) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T;
}

export type ParseResult<T> = { success: true; value: T } | { success: false; error?: string };

//TODO: remove
export const createType = <TKind, T>(kind: TKind, name: string) => new Typ<TKind, T>(kind, name);

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
