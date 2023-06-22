/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  TupleKeysToUnion,
  type Literal,
  type NotAUnion,
  type ObjectKeyMap,
  type OptionalPropertyNames,
  type PickPartially,
  type PickReadonly,
  type PropsOfType,
  type ReadonlyPropertyNames
} from '.';

//Need this symbol / property definition so that type inference will actual use the T parameter during type inference
//https://github.com/Microsoft/TypeScript/issues/29657#issuecomment-460728148
const type = Symbol('type');

export interface Type<TKind = unknown, T = unknown> {
  [type]?: T;
  kind: TKind;
  //TODO: Should the name be an array and support namespaces?
  name?: string;
}

export const createType = <TKind, T>(kind: TKind, name?: string): Type<TKind, T> => ({ kind, name });

// //TODO: verify that this copy and set will be sufficiently typed.
// export const name = <T extends Type<unknown, unknown>>(name: string, objType: T): typeof objType => ({
//   ...objType,
//   name
// });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const any = createType<'any', any>('any', 'any');
export type AnyType = typeof any;

export interface LiteralType<TLiteralValue> extends Type<'literal', TLiteralValue> {
  kind: 'literal';
  literal: TLiteralValue;
}
export const literal = <T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>): LiteralType<TLiteralValue> => ({
  kind: 'literal',
  literal: literalValue
});

export interface ArrayType<TElement extends Type<unknown, unknown>> extends Type<'array', unknown> {
  kind: 'array';
  elementType: TElement;
}

export const array = <TElement extends Type<unknown, unknown>>(element: TElement): ArrayType<TElement> => ({
  kind: 'array',
  elementType: element
});

export interface EnumType<TEnumValues extends unknown[], TMapOfEnumKeyToValue>
  extends Type<'enum', TupleKeysToUnion<TEnumValues>> {
  kind: 'enum';
  values: TEnumValues;
  enum: TMapOfEnumKeyToValue;
}

export interface UnionType<TMembers extends Type<unknown, unknown>> extends Type<'union', unknown> {
  kind: 'union';
  memberTypes: Array<TMembers>;
}

export interface TupleType<TElements extends Type<unknown, unknown>[]> extends Type<'tuple', unknown> {
  kind: 'tuple';
  elementTypes: TElements;
}

//TODO: rename shape to s for brevity?
//TODO: add a t property that is just the type of the properties, just like the shape.
//      makes it so you can do Foo.t.prop0 instead of Foo.shape.prop0.type
export interface ObjType<TShape> extends Type<'object', unknown> {
  kind: 'object';
  shape: TShape;
  k: ObjectKeyMap<TShape>;
}

export type Prop<T, TOptional, TReadonly> = {
  type: T;
  attributes: {
    isOptional: TOptional;
    isReadonly: TReadonly;
  };
};

//TODO: This may be old, but leaving this very important link
// UnionType should be able to be UnionType<Types> but there is a depth hueristic that blows up.
// That means functions and types have to cast until it's fixed
// https://github.com/microsoft/TypeScript/issues/34933

type MapPropDefinitionsToTsOptionals<T> = PickPartially<T, PropsOfType<T, Prop<Type<unknown, unknown>, true, unknown>>>;
type MapPropDefinitionsToTsReadonly<T> = PickReadonly<T, PropsOfType<T, Prop<Type<unknown, unknown>, unknown, true>>>;

// This converts an ObjectDefintion's properties from { prop0: Prop<T, true, true> } to {readonly prop0? : Prop<T, true, true>}
// It does this in preparation of converting the Props<> to their TypesScript types.
type MapPropDefinitionsToTsPropertyModifiers<T> = MapPropDefinitionsToTsOptionals<MapPropDefinitionsToTsReadonly<T>>;

type TypeOfPropDefinition<T> = T extends Prop<infer U, unknown, unknown> ? U : never;

// Introducing additional helpers typers that increase clarity causes inference to go crazy.
//  basically, only recurse inside of yourself.
//https://github.com/microsoft/TypeScript/issues/34933#issuecomment-776098985
//https://github.com/microsoft/TypeScript/issues/22575#issuecomment-776003717

type InferTupleKeys<T extends readonly unknown[], Acc extends readonly unknown[] = []> = T extends readonly [
  infer U,
  ...infer TRest
]
  ? InferTupleKeys<TRest, [...Acc, Infer<U>]>
  : Acc;

export type Infer<TDefinition> = TDefinition extends ArrayType<infer ElementDefinition>
  ? Array<Infer<ElementDefinition>>
  : TDefinition extends UnionType<infer MemberDefinitions>
  ? Infer<MemberDefinitions>
  : TDefinition extends TupleType<infer TElements>
  ? InferTupleKeys<TElements, []>
  : TDefinition extends ObjType<infer TShape>
  ? {
      //First add optional/readonly property modifiers to the DEFINITION, and then those modifiers will just get copied over to the TsType!
      [P in keyof MapPropDefinitionsToTsPropertyModifiers<TShape>]: Infer<
        TypeOfPropDefinition<MapPropDefinitionsToTsPropertyModifiers<TShape>[P]>
      >;
    }
  : TDefinition extends Type<unknown, infer T>
  ? T
  : never;

//TODO: this paradigm should be removed unless it can be made extensible is some way.
//Main entry to convert a TypeScript type to a Shape.  First need to detect a typescript union and then
export type ToShapeType<TsType> = NotAUnion<TsType> extends never
  ? UnionType<ToShapeTypeDistribute<TsType>>
  : ToShapeTypeDistribute<TsType>;

//TODO: should 'never' be part if this?
type ToShapeTypeDistribute<TsType> = TsType extends Literal<string, TsType>
  ? LiteralType<TsType>
  : TsType extends Literal<number, TsType>
  ? LiteralType<TsType>
  : TsType extends string
  ? Type<'string', string>
  : TsType extends number
  ? Type<'number', number>
  : TsType extends boolean
  ? Type<'boolean', boolean>
  : TsType extends bigint
  ? Type<'bigint', bigint>
  : TsType extends Date
  ? Type<'date', Date>
  : TsType extends null
  ? Type<'null', null>
  : TsType extends undefined
  ? Type<'undefined', undefined>
  : TsType extends Array<infer TElementType>
  ? ArrayType<ToShapeType<TElementType>>
  : TsType extends object
  ? ObjType<{
      //Make a property definition from the TypeScript type.
      //Remove any '| undefined' parts of the union because that's for optional properties.
      //The second argument to prop is wheather it's readonly
      -readonly [P in keyof TsType]-?: Prop<
        ToShapeType<Exclude<TsType[P], undefined>>,
        P extends OptionalPropertyNames<TsType> ? true : false,
        P extends ReadonlyPropertyNames<TsType> ? true : false
      >;
    }>
  : never;

//This takes UnionType<UnionType<t.string | t.number>> and flattens it to t.string | t.number
export type FlattenedUnion<T extends Type<unknown, unknown>> = T extends UnionType<infer K> ? FlattenedUnion<K> : T;

//First, if T is a TYPESCRIPT union of typedecl types like t.string | t.number, then we want the TypeScript Type
//to be UniontType<t.string | t.number>.  You use FlattenUnion<> to remove all surrounding UnionTypes before calling
//this.
export type CollapseSingleMemberUnionType<T extends Type<unknown, unknown>> = NotAUnion<T> extends never
  ? UnionWithAnyBecomesAny<UnionType<T>>
  : T;

//Will take a UnionType<typeof t.any | typeof t.string> and collapses it to AnyType, and it uses [] to prevent distribution over conditional types.
export type UnionWithAnyBecomesAny<T extends Type<unknown, unknown>> = T extends UnionType<infer K>
  ? [K | AnyType] extends [K]
    ? AnyType
    : T
  : T;

export type UnionOrSingleType<T extends Type<unknown, unknown>> = CollapseSingleMemberUnionType<FlattenedUnion<T>>;

// How to prevent conditional from being distributed
//https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
// type NoDistribute<T> = [T] extends [T] ? T : never;
