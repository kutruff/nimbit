import { ObjType, Prop, ToDefinitionType, Type } from './types';

// Object definition parameters allow either a property defintion or a type directly
export interface ObjectDefinitionParameters {
  [key: string]: Prop<unknown, unknown, unknown> | Type;
}

// Wrap a set of t.Types in Props<> - Allows people to use either "t.str" or "prop(t.str)" when defining objects
export type MapObjectDefParamsToPropDefinitions<T> = {
  [P in keyof T]: T[P] extends Prop<unknown, unknown, unknown> ? T[P] : Prop<T[P], false, false>;
};

//TODO: verify that this copy and set will be sufficiently typed.
// export const name = <T extends ObjType<unknown>>(objType: T, name: string): T => ({ ...objType, name });
export const name = <T extends { name: unknown }>(objType: T, name: unknown): typeof objType => ({ ...objType, name });

export function obj<TObjectDefinitionParams extends ObjectDefinitionParameters>(
  objectDefinitionParms: TObjectDefinitionParams,
  name?: string
): ObjType<MapObjectDefParamsToPropDefinitions<TObjectDefinitionParams>> {
  const objectDefinition = getObjectDefinition(objectDefinitionParms);
  return {
    kind: 'object',
    name,
    objectDefinition
  };
}

export function getObjectDefinition<TObjectDefinitionParams extends ObjectDefinitionParameters>(
  objectDefinition: TObjectDefinitionParams
): MapObjectDefParamsToPropDefinitions<TObjectDefinitionParams> {
  const result = {} as any;
  for (const key of Object.keys(objectDefinition)) {
    const prop = (
      isProp(objectDefinition[key])
        ? { ...objectDefinition[key] }
        : createPropDefinition(objectDefinition[key] as Type, false, false)
    ) as Prop<unknown, unknown, unknown>;
    prop.name = key;
    result[key] = prop;
  }
  return result as MapObjectDefParamsToPropDefinitions<TObjectDefinitionParams>;
}

export function declareObj<TShape>(name?: string): ToDefinitionType<TShape> {
  return {
    kind: 'object',
    name,
    objectDefintion: {}
  } as unknown as ToDefinitionType<TShape>;
}

export function defineDeclaration<TObjectDefintionParameters extends ObjectDefinitionParameters>(
  declaredObjType: ObjType<MapObjectDefParamsToPropDefinitions<TObjectDefintionParameters>>,
  objectDefinitionParams: TObjectDefintionParameters
) {
  declaredObjType.objectDefinition = getObjectDefinition(objectDefinitionParams);
}

export function prop<T extends Type>(propOrType: T) {
  return createPropDefinition(propOrType, false as const, false as const);
}

export function optProp<T extends Type>(propOrType: T) {
  return createPropDefinition(propOrType, true as const, false as const);
}

export function roProp<T extends Type>(propOrType: T) {
  return createPropDefinition(propOrType, false as const, true as const);
}

export function optRoProp<T extends Type>(propOrType: T) {
  return createPropDefinition(propOrType, true as const, true as const);
}

export function makeOptional<T extends Type, R extends boolean>(prop: Prop<T, unknown, R>) {
  return createPropDefinition<T, true, R>(prop.type, true, prop.attributes.isReadonly);
}

export function makeRequired<T extends Type, R extends boolean>(prop: Prop<T, unknown, R>) {
  return createPropDefinition<T, false, R>(prop.type, false, prop.attributes.isReadonly);
}

export function makeReadonly<T extends Type, O extends boolean>(prop: Prop<T, O, unknown>) {
  return createPropDefinition<T, O, true>(prop.type, prop.attributes.isOptional, true);
}

export function makeWritable<T extends Type, O extends boolean>(prop: Prop<T, O, unknown>) {
  return createPropDefinition<T, O, false>(prop.type, prop.attributes.isOptional, false);
}

export function createPropDefinition<T extends Type, TOptional = true, TReadonly = false>(
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
