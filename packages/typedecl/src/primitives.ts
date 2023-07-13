/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, pass, Typ } from '.';

//TODO: using this will avoid the need for passing kind twice
// export class Primitive<TKind extends string, TType> extends Typ<TKind, TType> {
//   constructor(kind: TKind) {
//     super(kind, kind);
//   }
// }

export class NullType extends Typ<'null', null> {
  parse(value: null) {
    return value === null ? pass(value) : fail();
  }
}

export const nul = new NullType('null', 'null');

export class UndefinedType extends Typ<'undefined', undefined> {
  parse(value: undefined) {
    return value === undefined ? pass(value) : fail();
  }
}

export const undef = new UndefinedType('undefined', 'undefined');

export class AnyType extends Typ<'any', any> {
  parse(value: any) {
    return pass(value);
  }
}

export const any = new AnyType('any', 'any');

export class UnknownType extends Typ<'unknown', unknown> {
  parse(value: unknown) {
    return pass(value);
  }
}

export const unknown = new UnknownType('unknown', 'unknown');

export const never = new Typ<'never', never>('never', 'never');

export class StringType extends Typ<'string', string> {
  parse(value: string) {
    return typeof value === 'string' ? pass(value) : fail();
  }
}

export const string = new StringType('string', 'string');

export class NumberType extends Typ<'number', number> {
  parse(value: number) {
    return typeof value === 'number' ? pass(value) : fail();
  }
}

export const number = new NumberType('number', 'number');

export class BooleanType extends Typ<'boolean', boolean> {
  parse(value: boolean) {
    return typeof value === 'boolean' ? pass(value) : fail();
  }
}

export const boolean = new BooleanType('boolean', 'boolean');

export class DateType extends Typ<'date', Date> {
  parse(value: Date) {
    return value instanceof Date && !isNaN(value.getTime()) ? pass(value) : fail();
  }
}

export const date = new DateType('date', 'date');

export class BigIntType extends Typ<'bigint', bigint> {
  parse(value: bigint) {
    return typeof value === 'bigint' ? pass(value) : fail();
  }
}

export const bigint = new BigIntType('bigint', 'bigint');

// export const bigint = createType<'bigint', bigint>('bigint', 'bigint');
// export const date = createType<'date', Date>('date', 'date');

// export const int8Array = createType<'int8Array', Int8Array>('int8Array', 'int8Array');
// export const uint8Array = createType<'uint8Array', Uint8Array>('uint8Array', 'uint8Array');
//prettier-ignore
// export const uint8ClampedArray = createType<'uint8ClampedArray', Uint8ClampedArray>('uint8ClampedArray', 'uint8ClampedArray');
// export const int16Array = createType<'int16Array', Int16Array>('int16Array', 'int16Array');
// export const uint16Array = createType<'uint16Array', Uint16Array>('uint16Array', 'uint16Array');
// export const int32Array = createType<'int32Array', Int32Array>('int32Array', 'int32Array');
// export const uint32Array = createType<'uint32Array', Uint32Array>('uint32Array', 'uint32Array');
// export const bigInt64Array = createType<'bigInt64Array', BigInt64Array>('bigInt64Array', 'bigInt64Array');
// export const bigUint64Array = createType<'bigUint64Array', BigUint64Array>('bigUint64Array', 'bigUint64Array');
// export const float32Array = createType<'float32Array', Float32Array>('float32Array', 'float32Array');
// export const float64Array = createType<'float64Array', Float64Array>('float64Array', 'float64Array');

// export function toParseResult<T>(value: unknown, success: boolean): ParseResult<T> {
//   return success ? { success, value: value as T } : { success };
// }

// function CreateTyp<TKind extends string, TType>(kind: TKind, parse: (value: unknown) => ParseResult<TType>) {
//   const theClass = class extends Typ<TKind, TType> {
//     // Mixins may not declare private/protected properties
//     // however, you can use ES2020 private fields
//     parse = parse;
//   };
//   return { class: theClass, type: new theClass(kind, kind) };
// }
