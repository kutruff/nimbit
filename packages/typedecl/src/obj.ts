/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { nul, undef } from './primitives';
import { type ObjType, type Prop, type ToDefinitionType, type Type } from './types';
import { union } from './union';

// Object definition parameters allow either a property defintion or a type directly
export interface ShapeDefinitionParameters {
  [key: string]: Prop<unknown, unknown, unknown, unknown> | Type;
}

// Wrap a set of t.Types in Props<> - Allows people to use either "t.str" or "prop(t.str)" when defining objects
export type MapShapeDefParamsToPropDefinitions<T> = {
  [P in keyof T]: T[P] extends Prop<infer TP, infer O, infer R, unknown>
    ? Prop<TP, O, R, P>
    : Prop<T[P], false, false, P>;
};

export function obj<TShapeDefinitionParams extends ShapeDefinitionParameters>(
  shapeDefinitionParms: TShapeDefinitionParams,
  name?: string
): ObjType<MapShapeDefParamsToPropDefinitions<TShapeDefinitionParams>> {
  const shapeDefinition = getShapeDefinition(shapeDefinitionParms);
  return {
    kind: 'object',
    name,
    shape: shapeDefinition
  };
}

export function getShapeDefinition<TShapeDefinitionParams extends ShapeDefinitionParameters>(
  shapeDefinition: TShapeDefinitionParams
): MapShapeDefParamsToPropDefinitions<TShapeDefinitionParams> {
  const result = {} as any;
  for (const key of Object.keys(shapeDefinition)) {
    const prop = (
      isProp(shapeDefinition[key])
        ? { ...shapeDefinition[key], name: key }
        : createPropDefinition(shapeDefinition[key] as Type, false, false, key)
    ) as Prop<unknown, unknown, unknown>;

    result[key] = prop;
  }
  return result as MapShapeDefParamsToPropDefinitions<TShapeDefinitionParams>;
}

export function declareObj<TShape>(name?: string): ToDefinitionType<TShape> {
  return {
    kind: 'object',
    name,
    objectDefintion: {}
  } as unknown as ToDefinitionType<TShape>;
}

export function defineDeclaration<TShapeDefintionParameters extends ShapeDefinitionParameters>(
  declaredObjType: ObjType<MapShapeDefParamsToPropDefinitions<TShapeDefintionParameters>>,
  shapeDefinitionParams: TShapeDefintionParameters
) {
  declaredObjType.shape = getShapeDefinition(shapeDefinitionParams);
}

export function prop<T extends Type>(type: T) {
  return createPropDefinition(type, false as const, false as const);
}

export function opt<T extends Type>(type: T) {
  return createPropDefinition(type, true as const, false as const);
}

export function optN<T extends Type>(type: T) {
  return createPropDefinition(union(type, nul), true as const, false as const);
}

export function ro<T extends Type>(type: T) {
  return createPropDefinition(type, false as const, true as const);
}

export function optRo<T extends Type>(type: T) {
  return createPropDefinition(type, true as const, true as const);
}

export function makeOptional<T extends Type, R extends boolean>(prop: Prop<T, unknown, R>) {
  return changePropAttributes<T, true, R>(prop, true, prop.attributes.isReadonly);
}

export function makeRequired<T extends Type, R extends boolean>(prop: Prop<T, unknown, R>) {
  return changePropAttributes<T, false, R>(prop, false, prop.attributes.isReadonly);
}

export function makeReadonly<T extends Type, O extends boolean>(prop: Prop<T, O, unknown>) {
  return changePropAttributes<T, O, true>(prop, prop.attributes.isOptional, true);
}

export function makeWritable<T extends Type, O extends boolean>(prop: Prop<T, O, unknown>) {
  return changePropAttributes<T, O, false>(prop, prop.attributes.isOptional, false);
}

export function nullable<T extends Type>(type: T) {
  return union(type, nul);
}

export function nullish<T extends Type>(type: T) {
  return union(type, nul, undef);
}

export function createPropDefinition<T extends Type, TOptional = true, TReadonly = false>(
  type: T,
  isOptional: TOptional,
  isReadonly: TReadonly,
  name?: string
): Prop<T, TOptional, TReadonly> {
  return {
    type,
    name,
    attributes: {
      isOptional: isOptional,
      isReadonly: isReadonly
    }
  };
}

export function changePropAttributes<T extends Type, TOptional = true, TReadonly = false>(
  prop: Prop<T, unknown, unknown>,
  isOptional: TOptional,
  isReadonly: TReadonly
): Prop<T, TOptional, TReadonly> {
  return {
    ...prop,
    attributes: {
      ...prop.attributes,
      isOptional: isOptional,
      isReadonly: isReadonly
    }
  };
}

export function isProp<T, O, R>(possibleProp: T | Prop<T, O, R>): possibleProp is Prop<T, O, R> {
  const prop = possibleProp as unknown as any;
  return prop.attributes != null && prop.type != null && prop.type.kind != null;
}
