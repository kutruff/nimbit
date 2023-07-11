/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  type _type,
  type Constructor,
  type ObjectKeyMap,
  type ParseResult,
  type ShapeDefinition,
  type ShapeDefinitionToObjType,
  type Type,
  type UnionType
} from '.';

export class ObjType<TShape, T> extends Typ<'object', T> {
  constructor(public shape: TShape, public k: ObjectKeyMap<TShape>, public name?: string) {
    super('object', name);
  }

  parseString(value: unknown): ParseResult<T> {
    if (typeof value !== 'string') {
      return { success: false };
    }
    try {
      value = JSON.parse(value);
    } catch (err) {
      return { success: false };
    }

    const result: any = {};
    const shape = this.shape as any;
    for (const key of getKeys(shape)) {
      const prop = shape[key];
      const propResult = prop.type.parse((value as any)[key]);

      if (!propResult.success) {
        return { success: false };
      }
      result[key] = propResult.value;
    }
    return { success: true, value: result };
  }

  parse(value: unknown): ParseResult<T> {
    if (typeof value !== 'object' || value === null) {
      return { success: false };
    }
    const result: any = {};
    const shape = this.shape as any;
    for (const key of getKeys(shape)) {
      const propResult = shape[key].type.parse((value as any)[key]);

      if (!propResult.success) {
        console.log(key);
        return { success: false };
      }
      result[key] = propResult.value;
    }
    return { success: true, value: result };
  }
}

export function toResult(success: false): { success: false };
export function toResult<T>(success: true, value: T): { success: true; value: T };
export function toResult<T>(success: boolean, value?: T): ParseResult<T> {
  return success ? { success: true, value: value as any } : { success: false };
}

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
    if (typeof shapeDefinition[key] === 'function') {
      shape[key] = obj(shapeDefinition[key] as Constructor);
    } else {
      shape[key] = shapeDefinition[key] as Type;
    }
  }

  resultObj.k = keyMap(shape);
  return resultObj as ShapeDefinitionToObjType<TShapeDefinition>;
}

export function opt<T extends Type>(type: T) {
  return union(type, undef);
}

export function optN<T extends Type>(type: T) {
  return union(type, undef, nul);
}

// export function ro<T extends Type>(type: T) {
//   return type;
// }

// export function optRo<T extends Type>(type: T) {
//   return union(type, undef);
// }

export function makeRequired<T extends Type>(type: T) {
  if (type.kind !== 'union') {
    return type;
  }

  return exclude(type as unknown as UnionType<T, unknown>, undef);
}

export function nullable<T extends Type>(type: T) {
  return union(type, nul);
}

export function nullish<T extends Type>(type: T) {
  return union(type, undef, nul);
}
