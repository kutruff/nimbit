export type TypeConverter<TSource, TDestinationType> = (value: TSource) => ParseResult<TDestinationType>;

export function pass<T>(value: T): ParseResult<T> {
  return { success: true as const, value };
}

export function fail(error?: string) {
  return { success: false as const, error };
}

export type ParseResult<T> = { success: true; value: T } | { success: false; error?: string };
