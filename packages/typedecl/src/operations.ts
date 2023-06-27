/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { areEqual } from './areEqual';
import {
  makeOptional,
  makeReadonly,
  makeRequired,
  makeWritable,
  never,
  obj,
  prop,
  type ElementType,
  type ObjType,
  type Prop,
  type Shape,
  type Type,
  type undef,
  type UnionOrSingleType,
  type UnionType
} from './index';
import { union } from './union';

export function intersection<TShapeA extends Shape, TShapeB extends Shape>(
  objectTypeA: ObjType<TShapeA>,
  objectTypeB: ObjType<TShapeB>
): ObjType<(typeof objectTypeA)['shape'] & (typeof objectTypeB)['shape']> {
  const merged = {} as Shape;

  const shapeA = objectTypeA.shape;
  const shapeB = objectTypeB.shape;

  const allKeysInAB = [...new Set(Object.keys(shapeA).concat(Object.keys(shapeB)))];

  for (const key of allKeysInAB) {
    const propertyA = shapeA[key];
    const propertyB = shapeB[key];

    if (propertyA == null && propertyB != null) {
      merged[key] = propertyB;
    } else if (propertyA != null && propertyB == null) {
      merged[key] = propertyA;
    } else if (propertyA != null && propertyB != null) {
      if (propertyA.type.kind === 'any') {
        merged[key] = propertyB;
      } else if (propertyA.type.kind === 'any') {
        merged[key] = propertyA;
      } else {
        switch (propertyA.type.kind) {
          case 'object': {
            if (propertyB.type.kind !== 'object') {
              return never as unknown as ObjType<(typeof objectTypeA)['shape'] & (typeof objectTypeB)['shape']>;
            }

            merged[key] = prop(intersection(propertyA.type as any, propertyB.type as any) as any);
            break;
          }
          default: {
            //TODO: what happens with optional and readonly props?
            if (areEqual(propertyA.type, propertyB.type)) {
              merged[key] = prop(propertyA.type);
            } else {
              return never as unknown as ObjType<(typeof objectTypeA)['shape'] & (typeof objectTypeB)['shape']>;
            }
            break;
          }
        }
      }
    }
  }

  const result = obj(merged);
  return result as unknown as ObjType<(typeof objectTypeA)['shape'] & (typeof objectTypeB)['shape']>;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T extends Type<unknown, unknown>, unknown, infer R>
    ? Prop<UnionOrSingleType<UnionType<T | typeof undef>>, true, R>
    : T[P];
};

export function partial<T extends Shape>(objType: ObjType<T>): ObjType<PartialType<T>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeOptional(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<PartialType<T>>;
}

type RemoveUnionUndef<T> = T extends UnionType<infer U> ? UnionOrSingleType<UnionType<Exclude<U, typeof undef>>> : T;

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, true, infer R> ? Prop<RemoveUnionUndef<T>, false, R> : T[P];
};

export function required<T extends Shape>(objType: ObjType<T>): ObjType<RequiredType<T>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeRequired(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<RequiredType<T>>;
}

export type ReadonlyType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, true> : never;
};

export function readonly<T extends Shape>(objType: ObjType<T>): ObjType<ReadonlyType<T>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeReadonly(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<ReadonlyType<T>>;
}

export type WritableType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, false> : never;
};

export function writable<T extends Shape>(objType: ObjType<T>): ObjType<WritableType<T>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeWritable(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<WritableType<T>>;
}

export function pick<T extends Shape, K extends keyof T>(objType: ObjType<T>, ...keys: Array<K>): ObjType<Pick<T, K>> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = objType.shape[key];
  }

  return obj(result) as unknown as ObjType<Pick<T, K>>;
}

export function omit<T extends Shape, K extends keyof T>(objType: ObjType<T>, ...keys: Array<K>): ObjType<Omit<T, K>> {
  const result = { ...objType.shape };

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
