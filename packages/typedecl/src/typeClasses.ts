import {
  _type,
  createMapOfTupleKeys,
  Typ,
  type IUnionType,
  type Literal,
  type MapOfTupleKeys,
  type TupleKeysToUnion,
  type Type,
  type Writeable
} from '.';

export class UnionType<TMembers extends Type<unknown, unknown>>
  extends Typ<'union', unknown>
  implements IUnionType<TMembers>
{
  constructor(public memberTypes: TMembers[], public name?: string) {
    super('union', name);
  }
}

export const literal = <T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>) => new LiteralType(literalValue);

export class LiteralType<TLiteralValue> extends Typ<'literal', TLiteralValue> {
  constructor(public literal: TLiteralValue, public name?: string) {
    super('literal', name);
  }
}

export const array = <TElement extends Type<unknown, unknown>>(element: TElement) => new ArrayType(element);

export class ArrayType<TElement> extends Typ<'array', unknown> {
  constructor(public elementType: TElement, public name?: string) {
    super('array', name);
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
  constructor(public values: TEnumValues, enumMap: TMapOfEnumKeyToValue, public name?: string) {
    super('enum', name);
    this.enum = enumMap;
  }
}

export const tuple = <TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(values: TTuple) =>
  new TupleType(values);

export class TupleType<TElements extends Type<unknown, unknown>[]> extends Typ<'tuple', unknown> {
  constructor(public elementTypes: TElements, public name?: string) {
    super('tuple', name);
  }
}
