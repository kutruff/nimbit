import { type ParseResult } from '.';

export type TypeConverter<TSource, TDestinationType> = (value: TSource) => ParseResult<TDestinationType>;
