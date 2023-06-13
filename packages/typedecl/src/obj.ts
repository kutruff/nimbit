import { ObjType, Prop, ToDefinitionType, Types } from './types';

// Object definition parameters allow either a property defintion or a type directly
export interface IObjectDefinitionParameters {
  [key: string]: Prop<unknown, unknown, unknown> | Types;
}

// Wrap a set of t.Types in Props<> - Allows people to use either "t.str" or "prop(t.str)" when defining objects
export type MapObjectDefParamsToPropDefinitions<T> = {
  [P in keyof T]: T[P] extends Prop<unknown, unknown, unknown> ? T[P] : Prop<T[P], false, false>;
};

export function obj<TObjectDefinitionParams extends IObjectDefinitionParameters>(
  objectDefinitionParms: TObjectDefinitionParams
): ObjType<MapObjectDefParamsToPropDefinitions<TObjectDefinitionParams>> {
  const objectDefinition = getObjectDefinition(objectDefinitionParms);
  return {
    kind: 'object',
    objectDefinition
  };
}

export function getObjectDefinition<TObjectDefinitionParams extends IObjectDefinitionParameters>(
  objectDefinition: TObjectDefinitionParams
): MapObjectDefParamsToPropDefinitions<TObjectDefinitionParams> {
  const result = {} as any;

  for (const key of Object.keys(objectDefinition)) {
    result[key] = isProp(objectDefinition[key])
      ? objectDefinition[key]
      : createPropDefinition(objectDefinition[key] as Types, false, false);
  }

  return result as MapObjectDefParamsToPropDefinitions<TObjectDefinitionParams>;
}

export function declareObj<TShape>(): ToDefinitionType<TShape> {
  return {
    kind: 'object',
    objectDefintion: {}
  } as unknown as ToDefinitionType<TShape>;
}

export function defineDeclaration<TObjectDefintionParameters extends IObjectDefinitionParameters>(
  declaredObjType: ObjType<MapObjectDefParamsToPropDefinitions<TObjectDefintionParameters>>,
  objectDefinitionParams: TObjectDefintionParameters
) {
  declaredObjType.objectDefinition = getObjectDefinition(objectDefinitionParams);
}

//Property Definitions

export function prop<T extends Types>(propOrType: T) {
  return createPropDefinition(propOrType, false as const, false as const);
}

export function optProp<T extends Types>(propOrType: T) {
  return createPropDefinition(propOrType, true as const, false as const);
}

export function roProp<T extends Types>(propOrType: T) {
  return createPropDefinition(propOrType, false as const, true as const);
}

export function optRoProp<T extends Types>(propOrType: T) {
  return createPropDefinition(propOrType, true as const, true as const);
}

export function makeOptional<T extends Types, R extends boolean>(prop: Prop<T, unknown, R>) {
  return createPropDefinition<T, true, R>(prop.type, true, prop.attributes.isReadonly);
}

export function makeRequired<T extends Types, R extends boolean>(prop: Prop<T, unknown, R>) {
  return createPropDefinition<T, false, R>(prop.type, false, prop.attributes.isReadonly);
}

export function makeReadonly<T extends Types, O extends boolean>(prop: Prop<T, O, unknown>) {
  return createPropDefinition<T, O, true>(prop.type, prop.attributes.isOptional, true);
}
export function makeWritable<T extends Types, O extends boolean>(prop: Prop<T, O, unknown>) {
  return createPropDefinition<T, O, false>(prop.type, prop.attributes.isOptional, false);
}

export function createPropDefinition<T extends Types, TOptional = true, TReadonly = false>(
  type: T,
  isOptional: TOptional,
  isReadonly: TReadonly
): Prop<T, TOptional, TReadonly> {
  return {
    type,
    attributes: {
      isOptional: isOptional,
      isReadonly: isReadonly
    }
  };
}

export function isProp<T, O, R>(possibleProp: T | Prop<T, O, R>): possibleProp is Prop<T, O, R> {
  return (possibleProp as Prop<T, O, R>).attributes !== undefined;
}
