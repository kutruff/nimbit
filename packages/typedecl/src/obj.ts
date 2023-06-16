/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getKeys, keyMap, nul, undef, union, type Constructor, type ObjType, type Prop, type Type } from '.';

export interface Shape {
  [key: string]: Prop<Type<unknown, unknown>, unknown, unknown>;
}

// Object definition allow either a property defintion or a type directly
export type ShapeDefinition =
  | {
      [key: string]: Prop<unknown, unknown, unknown> | Type<unknown, unknown> | Constructor;
    }
  | Constructor;

// Wrap a set of t.Types in Props<> - Allows people to use either "t.str" or "prop(t.str)" when defining objects
export type ShapeDefinitionToShape<T> = T extends Constructor
  ? ShapeDefinitionToShape<InstanceType<T>>
  : {
      [P in keyof T]: T[P] extends Constructor
        ? Prop<ObjType<ShapeDefinitionToShape<InstanceType<T[P]>>>, false, false>
        : T[P] extends Prop<unknown, unknown, unknown>
        ? T[P]
        : Prop<T[P], false, false>;
    };

export type ShapeDefinitionToObjType<T> = ObjType<ShapeDefinitionToShape<T>>;

export function obj<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition
): ShapeDefinitionToObjType<TShapeDefinition> {
  const shape = {} as any;
  const resultObj = { kind: 'object', shape } as any;

  if (typeof shapeDefinition === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const constructor = shapeDefinition as Constructor;
    const existingObj = constructorsToObj.get(constructor) as ShapeDefinitionToObjType<TShapeDefinition> | undefined;
    if (existingObj) {
      return existingObj;
    }
    constructorsToObj.set(constructor, resultObj);
    shapeDefinition = new constructor() as any;
  }

  for (const key of getKeys(shapeDefinition)) {
    if (isProp(shapeDefinition[key])) {
      shape[key] = { ...shapeDefinition[key] };
    } else if (typeof shapeDefinition[key] === 'function') {
      shape[key] = createProp(obj(shapeDefinition[key] as Constructor), false, false);
    } else {
      shape[key] = createProp(shapeDefinition[key] as Type, false, false);
    }
  }

  resultObj.k = keyMap(shape);
  return resultObj as ShapeDefinitionToObjType<TShapeDefinition>;
}

const constructorsToObj = new WeakMap();

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
