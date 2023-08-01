/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  failInvalidType,
  pass,
  propertyMap,
  Typ,
  type MapOfTupleKeys,
  type ParseResult,
  type TupleValuesToUnion,
  type Writeable
} from '.';

//TODO: why is an overload required here....
// prettier-ignore
export function enumm<TEnumValues extends readonly [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues): EnumType<Writeable<TEnumValues>, MapOfTupleKeys<TEnumValues>>;
// prettier-ignore
export function enumm<TEnumValues extends [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues): EnumType<TEnumValues, MapOfTupleKeys<TEnumValues>> {  
  return new EnumType(values, propertyMap(values), name);
}

export class EnumType<TEnumValues extends unknown[], TMapOfEnumKeyToValue> extends Typ<
  'enum',
  TEnumValues,
  TupleValuesToUnion<TEnumValues>
> {
  enum: TMapOfEnumKeyToValue;
  //TODO: may want to turn array into a Set for efficiency?
  constructor(values: TEnumValues, enumMap: TMapOfEnumKeyToValue, name?: string) {
    super('enum', values, name);
    this.enum = enumMap;
  }

  safeParse(value: unknown): ParseResult<TupleValuesToUnion<TEnumValues>> {
    for (const element of this.shape) {
      if (value === element) {
        return pass(element as any);
      }
    }
    return failInvalidType(this.name ?? this.kind, value);
  }

  // areEqual(other: Type<unknown, unknown>): boolean {
  //   const otherT = other as this;

  //   const values = this.shape;
  //   const otherValues = otherT.shape;

  //   if (this.name !== otherT.name || values.length !== otherValues.length) {
  //     return false;
  //   }
  //   //TODO: is O(n^2) the best we can do here since the set of values *should* be small?
  //   for (const value of values) {
  //     let result = false;
  //     for (const otherValue of otherValues) {
  //       if (value === otherValue) {
  //         result = true;
  //         break;
  //       }
  //     }
  //     if (!result) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }
}
