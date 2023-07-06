/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createMapOfTupleKeys,
  Typ,
  type MapOfTupleKeys,
  type ParseResult,
  type TupleKeysToUnion,
  type Writeable
} from '.';

// prettier-ignore
export function enumm<TEnumValues extends readonly [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues): EnumType<Writeable<TEnumValues>, MapOfTupleKeys<TEnumValues>>;
// prettier-ignore
export function enumm<TEnumValues extends [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues): EnumType<TEnumValues, MapOfTupleKeys<TEnumValues>> {
  return new EnumType(values, createMapOfTupleKeys(values), name);
}

export class EnumType<TEnumValues extends unknown[], TMapOfEnumKeyToValue> extends Typ<
  'enum',
  TupleKeysToUnion<TEnumValues>
> {
  enum: TMapOfEnumKeyToValue;
  //TODO: may want to turn array into a Set for efficiency?
  constructor(public values: TEnumValues, enumMap: TMapOfEnumKeyToValue, public name?: string) {
    super('enum', name);
    this.enum = enumMap;
  }
  parse(value: unknown): ParseResult<TupleKeysToUnion<TEnumValues>> {
    for (const element of this.values) {
      if (value === element) {
        return { success: true, value: element as any };
      }
    }
    return { success: false };
  }
}
