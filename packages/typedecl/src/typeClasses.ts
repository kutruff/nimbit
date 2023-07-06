/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  _type,
  createMapOfTupleKeys,
  Typ,
  type Infer,
  type InferTupleKeys,
  type InferTypeTsType,
  type IUnionType,
  type Literal,
  type MapOfTupleKeys,
  type ParseResult,
  type ToTsTypes,
  type TupleKeysToUnion,
  type Type,
  type Writeable,
  TsType
} from '.';

// TODO try redoing everything using the TOutput style
export class UnionType<TMembers extends Type<unknown, unknown>, T>
  extends Typ<'union', T>
  implements IUnionType<TMembers>
{
  constructor(public memberTypes: TMembers[], public name?: string) {
    super('union', name);
  }

  parse(value: unknown): ParseResult<T> {
    for (const member of this.memberTypes) {
      const result = (member as any).parse(value);
      if (result.success) {
        return result;
      }
      // failedResults.push(result);
    }
    return { success: false };
  }
}

export function parseUnion<TMembers extends Type<unknown, unknown>, T>(
  unionType: UnionType<TMembers, T>,
  value: unknown
): ParseResult<T> {
  // const failedResults = [];
  for (const member of unionType.memberTypes) {
    const result = (member as any).parse(value);
    if (result.success) {
      return result;
    }
    // failedResults.push(result);
  }
  return { success: false };
}

export const literal = <T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>) => new LiteralType(literalValue);

export class LiteralType<TLiteralValue> extends Typ<'literal', TLiteralValue> {
  constructor(public literal: TLiteralValue, public name?: string) {
    super('literal', name);
  }

  parse(value: unknown): ParseResult<TLiteralValue> {
    //does not handle new String() on purpose.
    return value === this.literal ? { success: true, value: this.literal } : { success: false };
  }
}

export function array<TElement extends Type<unknown, unknown>>(
  element: TElement
): ArrayType<TElement, Array<TsType<TElement>>> {
  return new ArrayType<TElement, Array<TsType<TElement>>>(element);
}

export class ArrayType<TElement, T> extends Typ<'array', T> {
  constructor(public elementType: TElement, public name?: string) {
    super('array', name);
  }

  parse(value: unknown): ParseResult<Array<Infer<TElement>>> {
    if (!Array.isArray(value)) {
      return { success: false };
    }
    const valueAsArray = value as unknown[];
    const parsedArray = [];
    for (const element of valueAsArray) {
      const result = (this.elementType as any).parse(element);
      if (!result.success) {
        return { success: false };
      }
      parsedArray.push(result.value);
    }
    return { success: true, value: parsedArray };
  }
}

// prettier-ignore
export function enumm<TEnumValues extends readonly [TValue, ...TValue[]], TValue extends string>(name: string, values: TEnumValues) : EnumType<Writeable<TEnumValues>, MapOfTupleKeys<TEnumValues>>
// prettier-ignore
export function enumm<TEnumValues extends [TValue, ...TValue[]], TValue extends string>(name: string,  values: TEnumValues) : EnumType<TEnumValues, MapOfTupleKeys<TEnumValues>> 
{
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

export const tuple = <TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(values: TTuple) =>
  new TupleType(values);

export class TupleType<TElements extends Type<unknown, unknown>[]> extends Typ<'tuple', unknown> {
  constructor(public elementTypes: TElements, public name?: string) {
    super('tuple', name);
  }
  parse(value: unknown): ParseResult<InferTupleKeys<TElements, []>> {
    if (!Array.isArray(value)) {
      return { success: false };
    }
    const valueAsArray = value as unknown[];
    const parsedTuple = [];
    parsedTuple.length = this.elementTypes.length;
    if (valueAsArray.length === this.elementTypes.length) {
      for (let i = 0; i < this.elementTypes.length; i++) {
        const result = (this.elementTypes[i] as any).parse(valueAsArray[i]);
        if (!result.success) {
          return { success: false };
        }
        parsedTuple[i] = result.value;
      }
    }

    return { success: true, value: parsedTuple as any };
  }
}
