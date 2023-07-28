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
  type NullT,
  type ParseResult,
  type Resolve,
  type TypeConverter,
  type UndefinedT,
  type UnionType
} from '.';

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

export type TsType<T extends Type<unknown, unknown>> = T[typeof _type];
export type Infer<T extends Type<unknown, unknown>> = Resolve<T[typeof _type]>;

export class Typ<TKind = unknown, TShape = unknown, T = unknown> implements Type<TKind, T> {
  [_type]!: T;

  //TODO: potential optimization for dealing with union types. If nothing has modified the default parse() we can then flatten unions.
  // otherwise we may just be able to use strict object equality and use the instance
  // hasBeenCustomized = false;

  constructor(public kind: TKind, public shape: TShape, public name?: string) {}

  // errorMessageOnFail(value: T, opts: ParseOptions): string | undefined {
  //   return undefined;
  // }

  isUnion(): boolean {
    return false;
  }

  opt(): UnionType<[typeof this, UndefinedT], T | undefined> {
    return union(this, undef) as any;
  }

  // nullable(): Typ<TKind | 'null', TShape | null, T | null> {
  nullable(): UnionType<[typeof this, NullT], T | null> {
    return union(this, nul) as any;
  }

  // nullish(): Typ<TKind | 'undefined' | 'null', TShape | undefined | null, T | undefined | null> {
  nullish(): UnionType<[typeof this, NullT, UndefinedT], T | null | undefined> {
    return union(this, undef, nul) as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  safeParse(value: unknown): ParseResult<T> {
    return fail();
  }

  parse(value: unknown): ParseResult<T> {
    const result = this.safeParse(value);
    if (result.success) {
      return result;
    }

    throw result.error;
  }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   return this.kind === other.kind;
  // }

  default(defaultValue: T): typeof this {
    const [clone, originalParse] = overrideSafeParse(this);
    clone.safeParse = function (value: T | undefined) {
      return value === undefined ? pass(defaultValue as any) : originalParse(value);
    };
    return clone;
  }

  catch(valueOnError: T): typeof this {
    const [clone, originalParse] = overrideSafeParse(this);
    clone.safeParse = function (value: T | undefined) {
      const result = originalParse(value);
      return result.success ? result : pass(valueOnError as any);
    };
    return clone;
  }

  where(predicate: (value: T) => boolean, message?: string): typeof this {
    const [clone, originalParse] = overrideSafeParse(this);
    clone.safeParse = function (value: T) {
      const result = originalParse(value);
      return !result.success ? result : predicate(result.data) ? result : fail({ kind: 'condition', message });
    };
    return clone;
  }

  tweak(transformer: (value: T) => T): typeof this {
    return this.to(this, x => pass(transformer(x))) as any as typeof this;
  }

  check(converter: TypeConverter<T, T>): typeof this {
    return this.to(this, converter) as any as typeof this;
  }

  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter?: TypeConverter<T, TsType<TDestination>>
  ): TDestination {
    const [clone, destinationParse] = overrideSafeParse(destination);
    const source = this;
    clone.safeParse = function (value: T) {
      const sourceResult = source.safeParse(value);
      if (!sourceResult.success) {
        return sourceResult;
      }

      if (converter) {
        const convertedResult = converter(sourceResult.data);
        return convertedResult.success ? destinationParse(convertedResult.data) : convertedResult;
      }
      return destinationParse(sourceResult.data);
    };

    return clone;
  }
}

export function coerce<TDestination extends Typ<unknown, unknown>, TSourceInput>(
  destination: TDestination,
  converter: TypeConverter<TSourceInput, TsType<TDestination>>
): TDestination {
  const [clone, originalParse] = overrideSafeParse(destination);

  clone.safeParse = function (value: TSourceInput) {
    const lastResult = converter(value);
    return lastResult.success ? originalParse(lastResult.data) : lastResult;
  };
  return clone;
}

export function overrideSafeParse<TType extends Typ<unknown, unknown, unknown>>(
  obj: TType
): [clone: TType, parse: TType['safeParse']] {
  const clone = cloneObject(obj);
  //TODO: may want to get rid of lambda if possible?
  return [clone, val => obj.safeParse(val) as any];
}

export function cloneObject<T>(obj: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}
