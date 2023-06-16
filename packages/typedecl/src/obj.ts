/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { keyMap, nul, undef, union, type ObjType, type Prop, type Type } from '.';

export interface Shape {
  [key: string]: Prop<Type<unknown, unknown>, unknown, unknown>;
}

//TODO: decide if this should go?
// const singletons = new WeakMap<object, object>();
// export const createOnce = <T extends object>(ctor: new () => T): T => {
//   let current = singletons.get(ctor) as T | undefined;
//   if (!current) {
//     current = new ctor();
//     singletons.set(ctor, current);
//   }
//   return current;
// };

//TODO: Could be a record? Record<PropertyKey, Prop<unknown, unknown, unknown> | Type<unknown, unknown>>
// Object definition parameters allow either a property defintion or a type directly
export interface ShapeDefinition {
  [key: string]: Prop<unknown, unknown, unknown> | Type<unknown, unknown>;
}
// Wrap a set of t.Types in Props<> - Allows people to use either "t.str" or "prop(t.str)" when defining objects
export type ShapeDefinitionToShape<T> = {
  [P in keyof T]: T[P] extends Prop<unknown, unknown, unknown> ? T[P] : Prop<T[P], false, false>;
};

export type ShapeDefinitionToObjType<T> = ObjType<ShapeDefinitionToShape<T>>;

export function obj<TShapeDefinition extends ShapeDefinition>(
  shapeDefinitionParms: TShapeDefinition
): ShapeDefinitionToObjType<TShapeDefinition> {
  const shapeDefinition = getShape(shapeDefinitionParms);
  return {
    kind: 'object',
    shape: shapeDefinition,
    k: keyMap(shapeDefinition)
  };
}

export function getShape<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition
): ShapeDefinitionToShape<TShapeDefinition> {
  const result = {} as any;
  for (const key of Object.keys(shapeDefinition)) {
    const prop = (
      isProp(shapeDefinition[key])
        ? { ...shapeDefinition[key] }
        : createProp(shapeDefinition[key] as Type, false, false)
    ) as Prop<unknown, unknown, unknown>;

    result[key] = prop;
  }
  return result as ShapeDefinitionToShape<TShapeDefinition>;
}

export function prop<T extends Type>(type: T) {
  return createProp(type, false as const, false as const);
}

export function opt<T extends Type>(type: T) {
  return createProp(type, true as const, false as const);
}

export function optN<T extends Type>(type: T) {
  return createProp(union(type, nul), true as const, false as const);
}

export function ro<T extends Type>(type: T) {
  return createProp(type, false as const, true as const);
}

export function optRo<T extends Type>(type: T) {
  return createProp(type, true as const, true as const);
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

export function createProp<T extends Type, TOptional = true, TReadonly = false>(
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
