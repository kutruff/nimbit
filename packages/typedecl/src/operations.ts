/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  areEqual,
  makeOptional,
  makeReadonly,
  makeRequired,
  makeWritable,
  never,
  obj,
  prop,
  union,
  type _type,
  type ElementType,
  type FlattenedUnion,
  type ObjType,
  type Prop,
  type Shape,
  type ToTsTypes,
  type TsType,
  type Type,
  type undef,
  type UnionType,
  type Writeable
} from '.';

export type ObjIntersection<TObjA extends ObjType<unknown, unknown>, TObjB extends ObjType<unknown, unknown>> = ObjType<
  TObjA['shape'] & TObjB['shape'],
  TObjA[typeof _type] & TObjB[typeof _type]
>;

export function intersection<TShapeA extends Shape, TsTypeA, TShapeB extends Shape, TsTypeB>(
  objectTypeA: ObjType<TShapeA, TsTypeA>,
  objectTypeB: ObjType<TShapeB, TsTypeB>
): ObjIntersection<typeof objectTypeA, typeof objectTypeB> {
  // ObjType<
  //   (typeof objectTypeA)['shape'] & (typeof objectTypeB)['shape'],
  //   (typeof objectTypeA)[typeof _type] & (typeof objectTypeB)[typeof _type]
  // >
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
              return never as unknown as ObjIntersection<typeof objectTypeA, typeof objectTypeB>;
            }

            merged[key] = prop(intersection(propertyA.type as any, propertyB.type as any) as any);
            break;
          }
          default: {
            //TODO: what happens with optional and readonly props?
            if (areEqual(propertyA.type, propertyB.type)) {
              merged[key] = prop(propertyA.type);
            } else {
              return never as unknown as ObjIntersection<typeof objectTypeA, typeof objectTypeB>;
            }
            break;
          }
        }
      }
    }
  }

  const result = obj(merged);
  return result as unknown as ObjIntersection<typeof objectTypeA, typeof objectTypeB>;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T extends Type<unknown, unknown>, unknown, infer R>
    ? Prop<UnionType<FlattenedUnion<T | typeof undef>, TsType<T | typeof undef>>, true, R>
    : T[P];
};

export function partial<TShape extends Shape, T>(
  objType: ObjType<TShape, T>
): ObjType<PartialType<TShape>, ToTsTypes<PartialType<TShape>>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeOptional(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<PartialType<TShape>, ToTsTypes<PartialType<TShape>>>;
}

type RemoveUnionUndef<T> = T extends UnionType<infer U, unknown>
  ? UnionType<FlattenedUnion<Exclude<U, typeof undef>>, ToTsTypes<Exclude<U, typeof undef>>>
  : T;

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, true, infer R> ? Prop<RemoveUnionUndef<T>, false, R> : T[P];
};

export function required<TShape extends Shape, T>(
  objType: ObjType<TShape, T>
): ObjType<RequiredType<TShape>, ToTsTypes<RequiredType<TShape>>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeRequired(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<RequiredType<TShape>, ToTsTypes<RequiredType<TShape>>>;
}

export type ReadonlyType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, true> : never;
};

export function readonly<TShape extends Shape, T>(
  objType: ObjType<TShape, T>
): ObjType<ReadonlyType<TShape>, Readonly<T>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeReadonly(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<ReadonlyType<TShape>, Readonly<T>>;
}

export type WritableType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, false> : never;
};

export function writable<TShape extends Shape, T>(
  objType: ObjType<TShape, T>
): ObjType<WritableType<TShape>, Writeable<T>> {
  const result = {} as Shape;

  for (const key of Object.keys(objType.shape)) {
    result[key] = makeWritable(objType.shape[key] as any);
  }

  return obj(result) as unknown as ObjType<WritableType<TShape>, Writeable<T>>;
}

export function pick<TShape extends Shape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Pick<TShape, K>, Pick<T, K>> {
  const result = {} as Pick<TShape, K>;

  for (const key of keys) {
    result[key] = objType.shape[key];
  }

  return obj(result) as unknown as ObjType<Pick<TShape, K>, Pick<T, K>>;
}

export function omit<TShape extends Shape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Omit<TShape, K>, Omit<T, K>> {
  const result = { ...objType.shape };

  for (const key of keys) {
    delete result[key];
  }

  return obj(result) as unknown as ObjType<Omit<TShape, K>, Omit<T, K>>;
}

export function exclude<TMemberTypes extends Type, T, K extends Type[]>(
  unionType: UnionType<TMemberTypes, T>,
  ...types: K
) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => !types.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return never;
  }

  return union(result as UnionType<Exclude<TMemberTypes, ElementType<K>>, Exclude<T, TsType<ElementType<K>>>>);
}

export function extract<TMemberTypes extends Type, T, K extends Type[]>(
  unionType: UnionType<TMemberTypes, T>,
  ...keys: K
) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => keys.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return never;
  }

  return union(result as UnionType<Extract<TMemberTypes, ElementType<K>>, Extract<T, TsType<ElementType<K>>>>);
}
