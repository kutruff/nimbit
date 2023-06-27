/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  exclude,
  getKeys,
  keyMap,
  nul,
  Typ,
  undef,
  union,
  type Constructor,
  type ObjectKeyMap,
  type Prop,
  type Type,
  type UnionType
} from '.';

export class ObjType<TShape> extends Typ<'object', unknown> {
  constructor(public shape: TShape, public k: ObjectKeyMap<TShape>, public name?: string) {
    super('object', name);
  }
}

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

export type DefToShape<T> = T extends Constructor
  ? DefToShape<InstanceType<T>>
  : {
      [P in keyof T]: T[P] extends Constructor
        ? Prop<ObjType<ShapeDefinitionToShape<InstanceType<T[P]>>>, false, false>
        : T[P] extends Prop<unknown, unknown, unknown>
        ? T[P]
        : Prop<T[P], false, false>;
    };

export type ShapeDefinitionToObjType<T> = ObjType<ShapeDefinitionToShape<T>>;

const constructorsToObj = new WeakMap();

//Note: the name is important here for recursive objects.
export function obj<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition,
  name?: string
): ShapeDefinitionToObjType<TShapeDefinition> {
  const resultObj = new ObjType({}, {}, name) as any;
  const shape = resultObj.shape;
  if (typeof shapeDefinition === 'function') {
    const constructor = shapeDefinition;
    const existingObj = constructorsToObj.get(constructor) as ShapeDefinitionToObjType<TShapeDefinition> | undefined;
    if (existingObj) {
      return existingObj;
    }
    constructorsToObj.set(constructor, resultObj);
    shapeDefinition = new (constructor as Constructor)() as any;
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

export function prop<T extends Type>(type: T) {
  return createProp(type, false as const, false as const);
}

export function opt<T extends Type>(type: T) {
  return createProp(union(type, undef), true as const, false as const);
}

export function optN<T extends Type>(type: T) {
  return createProp(union(type, undef, nul), true as const, false as const);
}

export function ro<T extends Type>(type: T) {
  return createProp(type, false as const, true as const);
}

export function optRo<T extends Type>(type: T) {
  return createProp(union(type, undef), true as const, true as const);
}

export function makeOptional<T extends Type, R extends boolean>(prop: Prop<T, unknown, R>) {
  return createProp(union(prop.type, undef), true, prop.attributes.isReadonly);
}

export function makeRequired<T extends Type, R extends boolean>(prop: Prop<T, unknown, R>) {
  if (!prop.attributes.isOptional || prop.type.kind !== 'union') {
    return createProp(prop.type, false, prop.attributes.isReadonly);
  }

  return createProp(exclude(prop.type as unknown as UnionType<T>, undef), false, prop.attributes.isReadonly);
}

export function makeReadonly<T extends Type, O extends boolean>(prop: Prop<T, O, unknown>) {
  return createProp<T, O, true>(prop.type, prop.attributes.isOptional, true);
}

export function makeWritable<T extends Type, O extends boolean>(prop: Prop<T, O, unknown>) {
  return createProp<T, O, false>(prop.type, prop.attributes.isOptional, false);
}

export function nullable<T extends Type>(type: T) {
  return union(type, nul);
}

export function nullish<T extends Type>(type: T) {
  return union(type, undef, nul);
}

export function createProp<T extends Type<unknown, unknown>, TOptional = true, TReadonly = false>(
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
  const prop = possibleProp as unknown as any;
  return prop.attributes != null && prop.type != null && prop.type.kind != null;
}
