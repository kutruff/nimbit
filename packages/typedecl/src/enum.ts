import { type EnumType, type Writeable, type MapOfTupleKeys } from '.';

// prettier-ignore
export function enumm<TEnumValues extends readonly [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues) : EnumType<Writeable<TEnumValues>, MapOfTupleKeys<TEnumValues>>
// prettier-ignore
export function enumm<TEnumValues extends [TValue, ...TValue[]], TValue extends string>(name: string,  values: TEnumValues) : EnumType<TEnumValues, MapOfTupleKeys<TEnumValues>> 
{
  return {
    kind: 'enum',
    name,
    values,
    enum: createMapOfTupleKeys(values),
  };
}

export function createMapOfTupleKeys<TTuple extends readonly [TValue, ...TValue[]], TValue extends PropertyKey>(
  tuple: TTuple
): MapOfTupleKeys<TTuple> {
  return tuple.reduce((acc, cur) => ({ ...acc, [cur]: cur }), {} as MapOfTupleKeys<TTuple>);
}
