import {
  Literal,
  NotAUnion,
  OptionalPropertyNames,
  PickPartially,
  PickReadonly,
  PropsOfType,
  ReadonlyPropertyNames
} from './generics';

export interface Type<TKind = unknown, T = unknown> {
  kind: TKind;
}

export interface LiteralType<TLiteralValue> extends Type<'literal', TLiteralValue> {
  kind: 'literal';
  literal: TLiteralValue;
}

export const literal = <T, TLiteralValue>(literalValue: Literal<T, TLiteralValue>): LiteralType<TLiteralValue> => ({
  kind: 'literal',
  literal: literalValue
});

export interface ArrayType<TElement extends Type<unknown, unknown> = Type<unknown, unknown>>
  extends Type<'array', Array<ToTsType<TElement>>> {
  kind: 'array';
  elementType: TElement;
}

export const array = <T extends Type<unknown, unknown>>(element: T): ArrayType<T> => ({
  kind: 'array',
  elementType: element
});

export interface UnionType<TMembers extends Type<unknown, unknown>> extends Type<'union', TMembers> {
  kind: 'union';
  memberTypes: Array<TMembers>;
}

export interface ObjType<TObjectDefinition> extends Type<'object', ToTsType<TObjectDefinition>> {
  kind: 'object';
  name?: string;
  objectDefinition: TObjectDefinition;
}

export type Prop<T, TOptional, TReadonly> = {
  type: T;
  attributes: {
    isOptional: TOptional;
    isReadonly: TReadonly;
  };
};

export interface ObjectDefinition {
  [key: string]: Prop<Type<unknown, unknown>, unknown, unknown>;
}

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

export type ToTsType<TDefinition> = TDefinition extends LiteralType<infer LiteralKind>
  ? LiteralKind
  : TDefinition extends ArrayType<infer ElementDefinition>
  ? Array<ToTsType<ElementDefinition>>
  : TDefinition extends UnionType<infer MemberDefinitions>
  ? ToTsType<MemberDefinitions>
  : TDefinition extends ObjType<infer TObjectDefinition>
  ? {
      //First add optional/readonly property modifiers to the DEFINITION, and then those modifiers will just get copied over to the TsType!
      [P in keyof MapPropDefinitionsToTsPropertyModifiers<TObjectDefinition>]: ToTsType<
        TypeOfPropDefinition<MapPropDefinitionsToTsPropertyModifiers<TObjectDefinition>[P]>
      >;
    }
  : TDefinition extends Type<unknown, infer T>
  ? T
  : never;

//Main entry to convert a TypeScript type to an ObjectDefinition.  First need to detect a typescript union and then
export type ToDefinitionType<TsType> = NotAUnion<TsType> extends never
  ? UnionType<ToDefinitionTypeDistribute<TsType>>
  : ToDefinitionTypeDistribute<TsType>;

//TODO: should 'never' be part if this?
type ToDefinitionTypeDistribute<TsType> = TsType extends Literal<string, TsType>
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
  ? ArrayType<ToDefinitionType<TElementType>>
  : TsType extends object
  ? ObjType<{
      //Make a property definition from the TypeScript type.
      //Remove any '| undefined' parts of the union because that's for optional properties.
      //The second argument to prop is wheather it's readonly
      -readonly [P in keyof TsType]-?: Prop<
        ToDefinitionType<Exclude<TsType[P], undefined>>,
        P extends OptionalPropertyNames<TsType> ? true : false,
        P extends ReadonlyPropertyNames<TsType> ? true : false
      >;
    }>
  : never;

export type AsTypes<T> = T extends Type<unknown, unknown> ? T : never;

//TODO: try to see if wrapping AsTypes is still necessary, or if that can happen higher up
export type FlattenedUnion<T extends Type<unknown, unknown>> = AsTypes<
  T extends UnionType<infer K> ? FlattenedUnion<K> : T
>;

export type CollapseSingleMemberUnionType<T extends Type<unknown, unknown>> = NotAUnion<T> extends never
  ? UnionType<T>
  : T;

// How to prevent conditional from being distributed
// type NoDistribute<T> = [T] extends [T] ? T : never;
