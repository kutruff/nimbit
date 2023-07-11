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

export class Typ<TKind = unknown, T = unknown> implements Type<TKind, T> {
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

  parse(_value: unknown): ParseResult<unknown> {
    return { success: false };
  }

  where(predicate: (value: T) => boolean): typeof this {
    const clone = cloneWithPrototype(this);
    const originalParse = clone.parse;
    clone.parse = function (value: unknown) {
      const result = originalParse(value) as ParseResult<T>;
      if (result.success && predicate.call(clone, result.value)) {
        return result;
      }
      return { success: false };
    };
    return clone;
  }

  from<TSource extends Typ<unknown, TSrc>, TSrc>(source: TSource, converter?: TypeConverter<TSrc, T>): typeof this;
  from(converter: TypeConverter<T, T>): typeof this;
  from<TSource extends Typ<unknown, TSrc>, TSrc>(
    source: TSource | TypeConverter<TSrc, T>,
    converter?: TypeConverter<TSrc, T>
  ): typeof this {
    const clone = cloneWithPrototype(this);
    const originalParse = clone.parse;

    if (typeof source === 'function') {
      clone.parse = function (value: unknown) {
        const lastResult = source(value as TSrc);

        if (lastResult.success) {
          return originalParse(lastResult.value);
        }

        return { success: false };
      };
    } else {
      clone.parse = function (value: unknown) {
        let lastResult = source.parse(value);

        if (lastResult.success) {
          if (converter) {
            lastResult = converter(value as TSrc);
          }

          if (lastResult.success) {
            return originalParse(lastResult.value);
          }
        }
        return { success: false };
      };
    }

    return clone;
  }

  to<TDestination extends Typ<unknown, TDest>, TDest>(
    destination: TDestination,
    converter?: TypeConverter<T, TDest>
  ): TDestination;
  to(converter: TypeConverter<T, T>): typeof this;
  to<TDestination extends Typ<unknown, TDest>, TDest>(
    destinationOrConverter: TDestination | TypeConverter<T, TDest>,
    converter?: TypeConverter<T, TDest>
  ): TDestination | typeof this {
    if (typeof destinationOrConverter === 'function') {
      const clone = cloneWithPrototype(this);
      const destinationParse = clone.parse;

      clone.parse = function (value: T) {
        const lastResult = destinationOrConverter(value);

        if (lastResult.success) {
          return destinationParse(lastResult.value);
        }

        return { success: false };
      };
      return clone;
    } else {
      const clone = cloneWithPrototype(destinationOrConverter);
      const destinationParse = clone.parse;
      const source = this;
      clone.parse = function (value: T) {
        let lastResult = source.parse(value);

        if (lastResult.success) {
          if (converter) {
            lastResult = converter(value);
          }

          if (lastResult.success) {
            return destinationParse(lastResult.value);
          }
        }
        return { success: false };
      };
      return clone;
    }
  }
}

//TODO: audit for any form of of prototype poisoning.
function cloneWithPrototype<T>(obj: T) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T;
}

export type ParseResult<T> = { success: true; value: T } | { success: false };

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
