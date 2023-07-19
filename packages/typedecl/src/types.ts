/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  exclude,
  fail,
  nul,
  pass,
  undef,
  union,
  type ComparisonCache,
  type Constructor,
  type Extend,
  type MakeUndefinedOptional,
  type ObjType,
  type ParseResult,
  type Resolve,
  type TypeConverter
} from '.';

export interface Parser<TInput, TOutput> {
  parse(value: TInput, opts?: ParseOptions): ParseResult<TOutput>;
}

export interface ParseOptions {
  strict?: boolean;
}

//Need this symbol / property definition so that type inference will actual use the T parameter during type inference
//https://github.com/Microsoft/TypeScript/issues/29657#issuecomment-460728148
export const _type: unique symbol = Symbol('type');

//TODO: evaluate if  this interface is needed now
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
  : ObjType<T, Resolve<MakeUndefinedOptional<ToTsTypes<T>>>>;

export type TsType<T extends Type<unknown, unknown>> = T[typeof _type];
export type Infer<T extends Type<unknown, unknown>> = Resolve<T[typeof _type]>;

// export function unionMembers<T extends Typ2<unknown, unknown>>(type: T): T[] {
//   return type.unionTypes.flatMap(x => x.unionTypes) as Array<T>;
// }

export class Typ<TKind = unknown, TShape = unknown, T = unknown> implements Type<TKind, T> {
  static defaultOpts: ParseOptions = {};

  [_type]!: T;
  unionTypes: Array<Typ<TKind, TShape, T>> = [];

  //TODO: potential optimization for dealing with union types. If nothing has modified the default parse() we can then flatten unions.
  // otherwise we may just be able to use strict object equality and use the instance
  //hasBeenCustomized = false;

  constructor(public kind: TKind, public shape: TShape, public name?: string) {}

  //TODO: figure out how best to have reflection for union types be more manageable.
  // //Helper to unwrap the shape of a single union type... Could be dangerous as it bypasses any wrapping union.
  // get s(): TShape {
  //   return this.unionTypes.length === 1 ? this.unionTypes[0]!.s : this.shape;
  // }

  isUnion(): boolean {
    return this.unionTypes.length > 0;
  }

  opt(): Typ<TKind | 'undefined', TShape | undefined, T | undefined> {
    return union(this, undef) as any;
  }

  nullable(): Typ<TKind | 'null', TShape | null, T | null> {
    return union(this, nul) as any;
  }

  nullish(): Typ<TKind | 'undefined' | 'null', TShape | undefined | null, T | undefined | null> {
    return union(this, undef, nul) as any;
  }

  //TODO: test
  unwrap(): Exclude<TKind, 'undefined'> extends never
    ? Typ<'never', never, never>
    : Typ<Exclude<TKind, 'undefined'>, Exclude<TShape, undefined>, Exclude<T, undefined>> {
    return exclude(this, undef) as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(value: T, opts = Typ.defaultOpts): ParseResult<T> {
    return fail();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
    return this.kind === other.kind;
  }

  default(defaultValue: T): Extend<typeof this, Parser<T | undefined, T>> {
    const [clone, originalParse] = overrideParse(this);
    clone.parse = function (value: T | undefined, opts = Typ.defaultOpts) {
      return value === undefined ? pass(defaultValue as any) : originalParse(value, opts);
    };
    return clone;
  }

  where(predicate: (value: T) => boolean): typeof this {
    const [clone, originalParse] = overrideParse(this);
    clone.parse = function (value: T, opts = Typ.defaultOpts) {
      const result = originalParse(value, opts);
      return result.success && predicate(result.value) ? result : fail();
    };
    return clone;
  }

  tweak(transformer: (value: T) => T): typeof this {
    return this.to(this, x => pass(transformer(x))) as any as typeof this;
  }

  to<TDestination extends Extend<Typ<unknown, unknown>, Parser<T, unknown>>>(
    destination: TDestination
  ): Extend<TDestination, Parser<T, TsType<TDestination>>>;

  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter: TypeConverter<T, TsType<TDestination>>
  ): Extend<TDestination, Parser<T, TsType<TDestination>>>;

  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter?: TypeConverter<T, TsType<TDestination>>
  ): Extend<TDestination, Parser<T, TsType<TDestination>>> {
    const [clone, destinationParse] = overrideParse(destination);
    const source = this;
    clone.parse = function (value: T, opts: ParseOptions = Typ.defaultOpts) {
      const sourceResult = source.parse(value, opts);
      if (!sourceResult.success) {
        return sourceResult;
      }

      if (converter) {
        const convertedResult = converter(sourceResult.value, opts);
        return convertedResult.success ? destinationParse(convertedResult.value, opts) : convertedResult;
      }
      return destinationParse(sourceResult.value, opts);
    };

    return clone;
  }
}

export function coerce<TDestination extends Typ<unknown, unknown>, TSourceInput>(
  destination: TDestination,
  converter: TypeConverter<TSourceInput, TsType<TDestination>>
): Extend<TDestination, Parser<TSourceInput, TsType<TDestination>>> {
  const [clone, originalParse] = overrideParse(destination);

  clone.parse = function (value: TSourceInput, opts = Typ.defaultOpts) {
    const lastResult = converter(value, opts);
    return lastResult.success ? originalParse(lastResult.value, opts) : lastResult;
  };
  return clone;
}

export function overrideParse<TType extends Typ<unknown, unknown, unknown>>(
  obj: TType
): [clone: TType, parse: TType['parse']] {
  const clone = cloneObject(obj);
  return [clone, clone.parse.bind(clone) as any];
}

//TODO: audit for any form of of prototype poisoning.
export function cloneObject<T>(obj: T) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T;
}
