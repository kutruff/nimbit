import { type ParseOptions } from './types';

export type TypeConverter<TSource, TDestinationType> = (
  value: TSource,
  opts?: ParseOptions
) => ParseResult<TDestinationType>;

export function pass<T>(value: T): ParseResult<T> {
  return { success: true as const, value };
}

export function fail(message?: string, error?: unknown) {
  return { success: false as const, message, error };
}

export type ParseResult<T> = { success: true; value: T } | { success: false; message?: string; error?: unknown };

export class ParseContext {
  path: string[] = [];

  push(key: string) {
    this.path.push(key);
  }
}
