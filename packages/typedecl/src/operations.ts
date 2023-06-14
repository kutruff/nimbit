import { areEqual } from './areEqual';
import {
  ElementType,
  ObjType,
  Prop,
  ShapeDefinition,
  Type,
  UnionType,
  makeOptional,
  makeReadonly,
  makeRequired,
  makeWritable,
  never,
  obj,
  prop
} from './index';
import { union } from './union';

export type Intersection<ObjTypeA, ObjTypeB> = ObjTypeA & ObjTypeB;

export function intersection<TObjectDefintionA extends ShapeDefinition, TShapeDefinitionB extends ShapeDefinition>(
  objectTypeA: ObjType<TObjectDefintionA>,
  objectTypeB: ObjType<TShapeDefinitionB>
): Intersection<typeof objectTypeA, typeof objectTypeB> {
  const merged = {} as ShapeDefinition;

  const shapeDefinitionA = objectTypeA.shape;
  const shapeDefinitionB = objectTypeB.shape;

  const allKeysInAB = [...new Set(Object.keys(shapeDefinitionA).concat(Object.keys(shapeDefinitionB)))];

  for (const key of allKeysInAB) {
    const propertyA = shapeDefinitionA[key];
    const propertyB = shapeDefinitionB[key];

    if (propertyA == null && propertyB != null) {
      merged[key] = propertyB;
    } else if (propertyA != null && propertyB == null) {
      merged[key] = propertyA;
    } else if (propertyA != null && propertyB != null) {
      switch (propertyA.type.kind) {
        case 'object': {
          if (propertyB.type.kind !== 'object') {
            return never as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
          }

          merged[key] = prop(intersection(propertyA.type as any, propertyB.type as any) as any);
          break;
        }
        default: {
          //TODO: what happens with optional and readonly props?
          if (areEqual(propertyA.type, propertyB.type)) {
            merged[key] = prop(propertyA.type);
          } else {
            return never as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
          }
          break;
        }
      }
    }
  }

  const result = obj(merged);
  return result as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, unknown, infer R, infer TKey extends P> ? Prop<T, true, R, TKey> : never;
};

export function partial<T extends ShapeDefinition>(objType: ObjType<T>): ObjType<PartialType<T>> {
  const result = {} as ShapeDefinition;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeOptional(objType.shape[key] as any);
  }

  return obj(result) as ObjType<PartialType<T>>;
}

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, unknown, infer R, infer TKey extends P> ? Prop<T, false, R, TKey> : never;
};

export function required<T extends ShapeDefinition>(objType: ObjType<T>): ObjType<RequiredType<T>> {
  const result = {} as ShapeDefinition;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeRequired(objType.shape[key] as any);
  }

  return obj(result) as ObjType<RequiredType<T>>;
}

export type ReadonlyType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown, infer TKey extends P> ? Prop<T, O, true, TKey> : never;
};

export function readonly<T extends ShapeDefinition>(objType: ObjType<T>): ObjType<ReadonlyType<T>> {
  const result = {} as ShapeDefinition;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeReadonly(objType.shape[key] as any);
  }

  return obj(result) as ObjType<ReadonlyType<T>>;
}

export type WritableType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown, infer TKey extends P> ? Prop<T, O, false, TKey> : never;
};

export function writable<T extends ShapeDefinition>(objType: ObjType<T>): ObjType<WritableType<T>> {
  const result = {} as ShapeDefinition;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeWritable(objType.shape[key] as any);
  }

  return obj(result) as ObjType<WritableType<T>>;
}

export function pick<T extends ShapeDefinition, K extends keyof T>(
  shapeDefinition: ObjType<T>,
  ...keys: Array<K>
): ObjType<Pick<T, K>> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = shapeDefinition.shape[key];
  }

  return obj(result) as unknown as ObjType<Pick<T, K>>;
}

export function omit<T extends ShapeDefinition, K extends keyof T>(
  shapeDefinition: ObjType<T>,
  ...keys: Array<K>
): ObjType<Omit<T, K>> {
  const result = { ...shapeDefinition.shape };

  for (const key of keys) {
    delete result[key];
  }

  return obj(result) as unknown as ObjType<Omit<T, K>>;
}

export function exclude<T extends Type, K extends Type[]>(unionType: UnionType<T>, ...types: K) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => !types.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return never;
  }

  return union(result as UnionType<Exclude<T, ElementType<K>>>);
}

export function extract<T extends Type, K extends Type[]>(unionType: UnionType<T>, ...keys: K) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => keys.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return never;
  }

  return union(result as UnionType<Extract<T, ElementType<K>>>);
}
