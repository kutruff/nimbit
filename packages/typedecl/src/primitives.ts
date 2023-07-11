import { createType, Typ, type ParseResult } from '.';

export class Primitive<TKind extends string, TType> extends Typ<TKind, TType> {
  constructor(kind: TKind) {
    super(kind, kind);
  }
}

export class StringType extends Typ<'string', string> {
  parseString(value: unknown) {
    return toParseResult<string>(value, typeof value === 'string');
  }

  parse(value: unknown) {
    return toParseResult<string>(value, typeof value === 'string');
  }
}

export const string = new StringType('string', 'string');

export class NumberType extends Typ<'number', number> {
  parseString(value: string) {
    const result = Number(value);
    return toParseResult<number>(result, isNaN(result));
  }

  parse(value: unknown) {
    return toParseResult<number>(value, typeof value === 'number');
  }
}

export const number = new NumberType('number', 'number');

export class BooleanType extends Typ<'boolean', boolean> {
  parse(value: unknown) {
    return toParseResult<boolean>(value, typeof value === 'boolean');
  }
}

export const boolean = new BooleanType('boolean', 'boolean');

export class NullType extends Typ<'null', null> {
  parse(value: unknown) {
    return toParseResult<null>(value, value === null);
  }
}

export const nul = new NullType('null', 'null');

export class UndefinedType extends Typ<'undefined', undefined> {
  parse(value: unknown) {
    return toParseResult<undefined>(value, value === undefined);
  }
}

export const undef = new UndefinedType('undefined', 'undefined');

export class DateType extends Typ<'date', Date> {
  parse(value: unknown) {
    return toParseResult<Date>(value, value instanceof Date && !isNaN(value.getTime()));
  }
}

export class AnyType extends Typ<'any', unknown> {
  parse(value: unknown) {
    return { success: true, value };
  }
}

export const any = new AnyType('any', 'any');

export const date = new DateType('date', 'date');

export class BigIntType extends Typ<'bigint', bigint> {
  parse(value: unknown) {
    return toParseResult<Date>(value, typeof value === 'bigint');
  }
}

export const bigint = new BigIntType('bigint', 'bigint');

// export const bigint = createType<'bigint', bigint>('bigint', 'bigint');
// export const date = createType<'date', Date>('date', 'date');

export const never = createType<'never', never>('never', 'never');
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

export function toParseResult<T>(value: unknown, success: boolean): ParseResult<T> {
  return success ? { success, value: value as T } : { success };
}

// function CreateTyp<TKind extends string, TType>(kind: TKind, parse: (value: unknown) => ParseResult<TType>) {
//   const theClass = class extends Typ<TKind, TType> {
//     // Mixins may not declare private/protected properties
//     // however, you can use ES2020 private fields
//     parse = parse;
//   };
//   return { class: theClass, type: new theClass(kind, kind) };
// }
