/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  _result,
  fail,
  failInvalidType,
  nul,
  pass,
  undef,
  union,
  type NullT,
  type ParseError,
  type ParseResult,
  type Resolve,
  type TypeConverter,
  type UndefinedT,
  type UnionType
} from '.';

//Need this symbol / property definition so that type inference will actual use the T parameter during type inference
//https://github.com/Microsoft/TypeScript/issues/29657#issuecomment-460728148
export const _type: unique symbol = Symbol();

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

  constructor(
    public kind: TKind,
    public shape: TShape,
    public name?: string
  ) {}

  // errorMessageOnFail(value: T, opts: ParseOptions): string | undefined {
  //   return undefined;
  // }

  isUnion(): boolean {
    return false;
  }

  opt(): UnionType<[this, UndefinedT], T | undefined> {
    return union(this, undef) as any;
  }

  // nullable(): Typ<TKind | 'null', TShape | null, T | null> {
  nullable(): UnionType<[this, NullT], T | null> {
    return union(this, nul) as any;
  }

  // nullish(): Typ<TKind | 'undefined' | 'null', TShape | undefined | null, T | undefined | null> {
  nullish(): UnionType<[this, NullT, UndefinedT], T | null | undefined> {
    return union(this, undef, nul) as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  safeParse(value: unknown): ParseResult<T> {
    return fail();
  }

  withName(name: string): this {
    const clone = cloneObject(this);
    clone.name = name;
    return clone;
  }

  parse(value: unknown): T {
    const result = this.safeParse(value);
    if (result.success) {
      return result.data;
    }

    throw result.error;
  }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   return this.kind === other.kind;
  // }

  default(defaultValue: T | (() => T)): this {
    const valueGetter: () => T = typeof defaultValue === 'function' ? (defaultValue as () => T) : () => defaultValue;
    const [clone, originalParse] = overrideSafeParse(this);
    clone.safeParse = function (value: T | undefined) {
      return value === undefined ? pass(valueGetter()) : originalParse(value);
    };
    return clone;
  }

  catch(valueOnError: T | ((error: ParseError) => T)): this {
    const valueGetter: (error: ParseError) => T =
      typeof valueOnError === 'function' ? (valueOnError as (error: ParseError) => T) : () => valueOnError;
    const [clone, originalParse] = overrideSafeParse(this);
    clone.safeParse = function (value: T | undefined) {
      const result = originalParse(value);
      return result.success ? result : pass(valueGetter(result.error));
    };
    return clone;
  }

  where(condition: (value: T) => boolean, customError?: string | ((value: T) => ParseError | string)): this {
    const [clone, originalParse] = overrideSafeParse(this);
    const errorCreator = getErrorCreator<T>(customError, (actual, message) => ({ kind: 'condition', actual, message }));
    clone.safeParse = function (value: T) {
      const result = originalParse(value);
      return !result.success ? result : condition(result.data) ? result : fail(errorCreator(value));
    };
    return clone;
  }

  tweak(converter: (value: T) => T, customError?: string | ((value: T) => ParseError | string)): this;
  tweak(converter: TypeConverter<T, T>): this;
  tweak(
    converter: ((value: T) => T) | TypeConverter<T, T>,
    customError?: string | ((value: T) => ParseError | string)
  ): this {
    return this.to(this, converter as any, customError);
  }

  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter: (value: T) => TsType<TDestination>,
    customError?: string | ((value: T) => ParseError | string)
  ): TDestination;
  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter?: TypeConverter<T, TsType<TDestination>>
  ): TDestination;
  to<TDestination extends Typ<unknown, unknown>>(
    destination: TDestination,
    converter?: ((value: T) => TsType<TDestination>) | TypeConverter<T, TsType<TDestination>>,
    customError?: string | ((value: T) => ParseError | string)
  ): TDestination {
    const [clone, destinationParse] = overrideSafeParse(destination);
    const source = this;

    const errorCreator = getErrorCreator<T>(customError, (value, message, error) => ({
      kind: 'thrown',
      error,
      message,
      actual: value
    }));

    clone.safeParse = function (value: T) {
      const sourceResult = source.safeParse(value);
      if (!sourceResult.success) {
        return sourceResult;
      }

      if (converter) {
        try {
          const convertedResult = converter(sourceResult.data);
          if (convertedResult && (convertedResult as any)[_result] === 1) {
            const asParseResult = convertedResult as ParseResult<unknown>;
            return asParseResult.success ? destinationParse(asParseResult.data) : asParseResult;
          } else {
            return destinationParse(convertedResult as TsType<TDestination>);
          }
        } catch (error) {
          return fail(errorCreator(value, error));
        }
      }
      return destinationParse(sourceResult.data);
    };

    return clone;
  }
}

export function createType<TKind extends string, TType>(
  kind: TKind,
  safeParser?: (value: unknown) => ParseResult<TType>
): Typ<TKind, TType, TType> {
  const instance = new Typ<TKind, TType, TType>(kind, undefined as TType, kind);
  instance.safeParse =
    safeParser || ((value: unknown) => (typeof value === kind ? pass(value as TType) : failInvalidType(kind, value)));
  return instance;
}

export type UnknownT = Typ<'unknown', unknown, unknown>;
export const unknown: UnknownT = createType('unknown', x => pass(x));

export function to<T, TDestination extends Typ<unknown, unknown>>(
  destination: TDestination,
  converter: (value: T) => TsType<TDestination>,
  customError?: string | ((value: T) => ParseError | string)
): TDestination;
export function to<T, TDestination extends Typ<unknown, unknown>>(
  destination: TDestination,
  converter: TypeConverter<T, TsType<TDestination>>
): TDestination;
export function to<T, TDestination extends Typ<unknown, unknown>>(
  destination: TDestination,
  converter: ((value: T) => TsType<TDestination>) | TypeConverter<T, TsType<TDestination>>,
  customError?: string | ((value: T) => ParseError | string)
): TDestination {
  return unknown.to(destination, converter as any, customError as any);
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

export type ErrorParameter<T> = string | ((value: T) => ParseError | string);

export function getErrorCreator<T>(
  errorParams: ErrorParameter<T> | undefined,
  defaultError: (value: T, message?: string, ...rest: unknown[]) => ParseError
): (value: T, ...rest: unknown[]) => ParseError {
  return errorParams === undefined || typeof errorParams === 'string'
    ? (value, ...rest) => defaultError(value, errorParams, ...rest)
    : value => {
        const result = errorParams(value);
        return typeof result === 'string' ? { kind: 'general', actual: value, message: result } : result;
      };
}
