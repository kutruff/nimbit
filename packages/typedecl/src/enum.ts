/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createMapOfTupleKeys,
  fail,
  pass,
  Typ,
  type MapOfTupleKeys,
  type ParseResult,
  type TupleKeysToUnion,
  type Type,
  type Writeable
} from '.';

// prettier-ignore
export function enumm<TEnumValues extends readonly [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues): EnumType<Writeable<TEnumValues>, MapOfTupleKeys<TEnumValues>>;
// prettier-ignore
export function enumm<TEnumValues extends [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues): EnumType<TEnumValues, MapOfTupleKeys<TEnumValues>> {
  return new EnumType(values, createMapOfTupleKeys(values), name);
}

export class EnumType<
  TEnumValues extends unknown[],
  TMapOfEnumKeyToValue,
  TInput = TupleKeysToUnion<TEnumValues>
> extends Typ<'enum', TupleKeysToUnion<TEnumValues>, TInput> {
  enum: TMapOfEnumKeyToValue;
  //TODO: may want to turn array into a Set for efficiency?
  constructor(public values: TEnumValues, enumMap: TMapOfEnumKeyToValue, name?: string) {
    super('enum', name);
    this.enum = enumMap;
  }

  parse(value: TInput): ParseResult<TupleKeysToUnion<TEnumValues>> {
    for (const element of this.values) {
      if (value === element) {
        return pass(element as any);
      }
    }
    return fail();
  }

  areEqual(other: Type<unknown, unknown>): boolean {
    const otherT = other as typeof this;

    const values = this.values;
    const otherValues = otherT.values;

    if (this.name !== otherT.name || values.length !== otherValues.length) {
      return false;
    }
    //TODO: is O(n^2) the best we can do here since the set of values *should* be small?
    for (const value of values) {
      let result = false;
      for (const otherValue of otherValues) {
        if (value === otherValue) {
          result = true;
          break;
        }
      }
      if (!result) {
        return false;
      }
    }
    return true;
  }
}
