import { Type } from './types';

export const str: Type<'string', string> = { kind: 'string' };
export const num: Type<'number', number> = { kind: 'number' };
export const bool: Type<'boolean', boolean> = { kind: 'boolean' };
export const bgint: Type<'bigint', bigint> = { kind: 'bigint' };
export const dte: Type<'date', Date> = { kind: 'date' };
export const nul: Type<'null', null> = { kind: 'null' };
export const undef: Type<'undefined', undefined> = { kind: 'undefined' };
export const nevr: Type<'never', never> = { kind: 'never' };

export const int8Array: Type<'Int8Array', Int8Array> = { kind: 'Int8Array' };
export const uint8Array: Type<'Uint8Array', Uint8Array> = { kind: 'Uint8Array' };
export const uint8ClampedArray: Type<'Uint8ClampedArray', Uint8ClampedArray> = { kind: 'Uint8ClampedArray' };
export const int16Array: Type<'Int16Array', Int16Array> = { kind: 'Int16Array' };
export const uint16Array: Type<'Uint16Array', Uint16Array> = { kind: 'Uint16Array' };
export const int32Array: Type<'Int32Array', Int32Array> = { kind: 'Int32Array' };
export const uint32Array: Type<'Uint32Array', Uint32Array> = { kind: 'Uint32Array' };
export const bigInt64Array: Type<'BigInt64Array', BigInt64Array> = { kind: 'BigInt64Array' };
export const bigUint64Array: Type<'BigUint64Array', BigUint64Array> = { kind: 'BigUint64Array' };
export const float32Array: Type<'Float32Array', Float32Array> = { kind: 'Float32Array' };
export const float64Array: Type<'Float64Array', Float64Array> = { kind: 'Float64Array' };
