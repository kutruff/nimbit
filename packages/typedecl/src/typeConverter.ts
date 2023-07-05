import type * as t from '.';

// import * as toFluent from './operations';

export interface TypeConverter<
  TSource extends t.Type<unknown, unknown>,
  TDestination extends t.Type<unknown, unknown>
> {
  sourceType: TSource;
  destinationType: TDestination;
  convert: (value: t.Infer<TSource>, sourceType: TSource, destinationType: TDestination) => t.Infer<TDestination>;
}

export function createConverter<
  TSource extends t.Type<unknown, unknown>,
  TDestination extends t.Type<unknown, unknown>
>(
  sourceType: TSource,
  destinationType: TDestination,
  convert: (value: t.Infer<TSource>) => t.Infer<TDestination>
): TypeConverter<TSource, TDestination> {
  return {
    convert,
    sourceType,
    destinationType
  };
}
