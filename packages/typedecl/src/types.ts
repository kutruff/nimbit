/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  fail,
  nul,
  pass,
  undef,
  union,
  type ComparisonCache,
  type Constructor,
  type MakeUndefinedOptional,
  type Merge,
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

export class Typ<TKind = unknown, T = unknown> implements Type<TKind, T> {
  [_type]!: T;

  static defaultOpts: ParseOptions = {};

  constructor(public kind: TKind, public name?: string) {}

  get opt() {
    return union(this, undef);
  }

  get nullable() {
    return union(this, nul);
  }

  get nullish() {
    return union(this, undef, nul);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  areEqual(other: Type<unknown, unknown>, cache: ComparisonCache): boolean {
    return this.kind === other.kind;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(value: T, opts = Typ.defaultOpts): ParseResult<T> {
    return fail();
  }

  default(defaultValue: T): Merge<typeof this, Parser<T | undefined, T>> {
    const clone = cloneObject(this);
    const originalParse = clone.parse.bind(clone);
    clone.parse = function (value: T | undefined, opts = Typ.defaultOpts) {
      return value === undefined ? pass(defaultValue as any) : originalParse(value, opts);
    };
    return clone;
  }

  where(predicate: (value: T) => boolean): typeof this {
    const clone = cloneObject(this);
    const originalParse = clone.parse.bind(clone);
    clone.parse = function (value: T, opts = Typ.defaultOpts) {
      const result = originalParse(value, opts);
      return result.success && predicate(result.value) ? result : fail();
    };
    return clone;
  }

  tweak(transformer: (value: T) => T): typeof this {
    return this.to(this, x => pass(transformer(x))) as typeof this;
  }

  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter?: TypeConverter<T, TsType<TDestination>>
  ): Merge<TDestination, Parser<T, TsType<TDestination>>> {
    const clone = cloneObject(destination) as any;
    const destinationParse = clone.parse.bind(clone);
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
): Merge<TDestination, Parser<TSourceInput, TsType<TDestination>>> {
  const clone = cloneObject(destination);
  const originalParse = clone.parse.bind(clone);

  clone.parse = function (value: TSourceInput, opts = Typ.defaultOpts) {
    const lastResult = converter(value, opts);
    return lastResult.success ? originalParse(lastResult.value, opts) : lastResult;
  };
  return clone;
}

//TODO: audit for any form of of prototype poisoning.
function cloneObject<T>(obj: T) {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T;
}
