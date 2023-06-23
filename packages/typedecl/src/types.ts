import {
  createProp,
  nul,
  undef,
  union,
  type ArrayType,
  type Literal,
  type LiteralType,
  type NotAUnion,
  type ObjType,
  type OptionalPropertyNames,
  type PickPartially,
  type PickReadonly,
  type PropsOfType,
  type ReadonlyPropertyNames,
  type TupleType,
  type UnionType
} from '.';

//Need this symbol / property definition so that type inference will actual use the T parameter during type inference
//https://github.com/Microsoft/TypeScript/issues/29657#issuecomment-460728148
export const _type = Symbol('type');

export interface Type<TKind = unknown, T = unknown> {
  //This property is never used. By having a hidden/optional and practically usettable property, TS will use the T parameter during type inference.
  [_type]?: T;
  kind: TKind;
  //TODO: Should the name be an array and support namespaces?
  name?: string;
}

export class Typ<TKind = unknown, T = unknown> implements Type<TKind, T> {
  [_type]?: T;
  constructor(public kind: TKind, public name?: string) {}
  opt() {
    //TODO: switch optional to be a union of undefined and the type
    return createProp(this, true as const, false as const);
  }

  optN() {
    return createProp(union(this, nul), true as const, false as const);
  }

  ro() {
    return createProp(this, false as const, true as const);
  }

  optRo() {
    return createProp(this, true as const, true as const);
  }

  nullable() {
    return union(this, nul, undef);
  }

  nullish() {
    return union(this, nul, undef);
  }
}

export const createType = <TKind, T>(kind: TKind, name?: string) => new Typ<TKind, T>(kind, name);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const any = createType<'any', any>('any', 'any');
export type AnyType = typeof any;

//Required for type inference of the return type for the union() function
export interface IUnionType<TMembers extends Type<unknown, unknown>> extends Type<'union', unknown> {
  memberTypes: TMembers[];
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

//This takes UnionType<UnionType<t.string | t.number>> and flattens it to t.string | t.number
export type FlattenedUnion<T> = T extends IUnionType<infer K> ? FlattenedUnion<K> : T;

//First, if T is a TYPESCRIPT union of typedecl types like t.string | t.number, then we want the TypeScript Type
//to be UniontType<t.string | t.number>.  You use FlattenUnion<> to remove all surrounding UnionTypes before calling
//this.
export type CollapseSingleMemberUnionType<T extends Type<unknown, unknown>> = NotAUnion<T> extends never
  ? UnionWithAnyBecomesAny<UnionType<T>>
  : T;

//Will take a UnionType<typeof t.any | typeof t.string> and collapses it to AnyType, and it uses [] to prevent distribution over conditional types.
// Note: this presently will turn UnionType<Type<unknown, unknown> | anything > into AnyType which may not be what we want.
export type UnionWithAnyBecomesAny<T extends Type<unknown, unknown>> = T extends IUnionType<infer K>
  ? [K | AnyType] extends [K]
    ? AnyType
    : T
  : T;

export type UnionOrSingleType<T extends Type<unknown, unknown>> = CollapseSingleMemberUnionType<FlattenedUnion<T>>;

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
  ? Typ<'string', string>
  : TsType extends number
  ? Typ<'number', number>
  : TsType extends boolean
  ? Typ<'boolean', boolean>
  : TsType extends bigint
  ? Typ<'bigint', bigint>
  : TsType extends Date
  ? Typ<'date', Date>
  : TsType extends null
  ? Typ<'null', null>
  : TsType extends undefined
  ? Typ<'undefined', undefined>
  : TsType extends Array<infer TElementType>
  ? ArrayType<ToShapeType<TElementType>>
  : TsType extends object
  ? ObjType<{
      //Make a property definition from the TypeScript type.
      //Remove any '| undefined' parts of the union because that's for optional properties.
      //The second argument to prop is whether it's readonly
      -readonly [P in keyof TsType]-?: Prop<
        ToShapeType<Exclude<TsType[P], undefined>>,
        P extends OptionalPropertyNames<TsType> ? true : false,
        P extends ReadonlyPropertyNames<TsType> ? true : false
      >;
    }>
  : never;
