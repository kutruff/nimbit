/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  exclude,
  fail,
  getKeys,
  keyMap,
  nul,
  pass,
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

export class ObjType<TShape, T, TInput = T> extends Typ<'object', T, TInput> {
  constructor(public shape: TShape, public k: ObjectKeyMap<TShape>, public name?: string) {
    super('object', name);
  }

  _withInput<TNewInput>(): ObjType<TShape, T, TNewInput> {
    return undefined as any;
  }

  parseString(value: unknown): ParseResult<T> {
    if (typeof value !== 'string') {
      return fail();
    }
    try {
      value = JSON.parse(value);
    } catch (err) {
      return fail();
    }

    const result: any = {};
    const shape = this.shape as any;
    for (const key of getKeys(shape)) {
      const prop = shape[key];
      const propResult = prop.parse((value as any)[key]);

      if (!propResult.success) {
        return fail();
      }
      result[key] = propResult.value;
    }
    return pass(result);
  }

  parse(value: TInput): ParseResult<T> {
    if (typeof value !== 'object' || value === null) {
      return fail();
    }
    const result: any = {};

    const shape = this.shape as any;
    for (const key of getKeys(shape)) {
      const propResult = shape[key].parse((value as any)[key]);

      if (!propResult.success) {
        return fail();
      }
      result[key] = propResult.value;
    }
    return pass(result);
  }
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
