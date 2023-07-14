/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  areEqual,
  never,
  obj,
  undef,
  union,
  type _type,
  type ElementType,
  type FlattenedUnion,
  type ObjType,
  type Shape,
  type ToTsTypes,
  type TsType,
  type Type,
  type UnionType
} from '.';

export type ObjIntersection<TObjA extends ObjType<unknown, unknown>, TObjB extends ObjType<unknown, unknown>> = ObjType<
  TObjA['shape'] & TObjB['shape'],
  TObjA[typeof _type] & TObjB[typeof _type]
>;

export function intersection<TShapeA, TsTypeA, TShapeB, TsTypeB>(
  objectTypeA: ObjType<TShapeA, TsTypeA>,
  objectTypeB: ObjType<TShapeB, TsTypeB>
): ObjIntersection<typeof objectTypeA, typeof objectTypeB> {
  const merged = {} as Shape;

  const shapeA = objectTypeA.shape as Shape;
  const shapeB = objectTypeB.shape as Shape;

  const allKeysInAB = new Set(Object.keys(shapeA).concat(Object.keys(shapeB)));

  for (const key of allKeysInAB) {
    const propertyA = shapeA[key];
    const propertyB = shapeB[key];

    if (propertyA == null && propertyB != null) {
      merged[key] = propertyB;
    } else if (propertyA != null && propertyB == null) {
      merged[key] = propertyA;
    } else if (propertyA != null && propertyB != null) {
      if (propertyA.kind === 'any') {
        merged[key] = propertyB;
      } else if (propertyB.kind === 'any') {
        merged[key] = propertyA;
      } else {
        switch (propertyA.kind) {
          case 'object': {
            if (propertyB.kind !== 'object') {
              return never as unknown as ObjIntersection<typeof objectTypeA, typeof objectTypeB>;
            }

            merged[key] = intersection(propertyA as any, propertyB as any) as any;
            break;
          }
          default: {
            //TODO: what happens with optional and readonly props?
            if (areEqual(propertyA, propertyB)) {
              merged[key] = propertyB;
            } else {
              return never as unknown as ObjIntersection<typeof objectTypeA, typeof objectTypeB>;
            }
            break;
          }
        }
      }
    }
  }

  return obj(merged) as unknown as ObjIntersection<typeof objectTypeA, typeof objectTypeB>;
}

export type Merge<TA, TB> = Omit<TA, keyof TB> & TB;

export type ObjMerge<TObjA extends ObjType<unknown, unknown>, TObjB extends ObjType<unknown, unknown>> = ObjType<
  Merge<TObjA['shape'], TObjB['shape']>,
  Merge<TObjA[typeof _type], TObjB[typeof _type]>
>;

export function merge<TShapeA, TsTypeA, TShapeB, TsTypeB>(
  objectTypeA: ObjType<TShapeA, TsTypeA>,
  objectTypeB: ObjType<TShapeB, TsTypeB>
): ObjMerge<typeof objectTypeA, typeof objectTypeB> {
  const merged = {} as Shape;

  const shapeA = objectTypeA.shape as Shape;
  const shapeB = objectTypeB.shape as Shape;

  const allKeysInAB = new Set(Object.keys(shapeA).concat(Object.keys(shapeB)));

  for (const key of allKeysInAB) {
    merged[key] = shapeB[key] || (shapeA[key] as Type<unknown, unknown>);
  }

  return obj(merged) as unknown as ObjMerge<typeof objectTypeA, typeof objectTypeB>;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Type<unknown, unknown>
    ? UnionType<FlattenedUnion<T[P] | typeof undef>, TsType<T[P] | typeof undef>>
    : never;
};

export function partial<TShape, T>(
  objType: ObjType<TShape, T>
): ObjType<PartialType<TShape>, Partial<ToTsTypes<PartialType<TShape>>>> {
  const result = {} as Shape;
  const shape = objType.shape as Shape;
  for (const key of Object.keys(shape)) {
    result[key] = union(shape[key] as any, undef);
  }

  return obj(result) as unknown as ObjType<PartialType<TShape>, ToTsTypes<PartialType<TShape>>>;
}

type RemoveUnionUndef<T> = T extends UnionType<infer U, unknown>
  ? UnionType<FlattenedUnion<Exclude<U, typeof undef>>, ToTsTypes<Exclude<U, typeof undef>>>
  : T;

export type RequiredType<T> = {
  [P in keyof T]: RemoveUnionUndef<T[P]>;
};

export function required<TShape, T>(
  objType: ObjType<TShape, T>
): ObjType<RequiredType<TShape>, ToTsTypes<RequiredType<TShape>>> {
  const result = {} as Shape;

  const shape = objType.shape as Shape;
  for (const key of Object.keys(shape)) {
    const type = shape[key]!;
    const madeRequired = type.kind !== 'union' ? type : exclude(type as any, undef);
    result[key] = madeRequired;
  }

  return obj(result) as unknown as ObjType<RequiredType<TShape>, ToTsTypes<RequiredType<TShape>>>;
}

// export type ReadonlyType<T> = {
//   [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, true> : never;
// };

// export function readonly<TShape extends Shape, T>(
//   objType: ObjType<TShape, T>
// ): ObjType<ReadonlyType<TShape>, Readonly<T>> {
//   const result = {} as Shape;

//   for (const key of Object.keys(objType.shape)) {
//     result[key] = makeReadonly(objType.shape[key] as any);
//   }

//   return obj(result) as unknown as ObjType<ReadonlyType<TShape>, Readonly<T>>;
// }

// export type WritableType<T> = {
//   [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, false> : never;
// };

// export function writable<TShape extends Shape, T>(
//   objType: ObjType<TShape, T>
// ): ObjType<WritableType<TShape>, Writeable<T>> {
//   const result = {} as Shape;

//   for (const key of Object.keys(objType.shape)) {
//     result[key] = makeWritable(objType.shape[key] as any);
//   }

//   return obj(result) as unknown as ObjType<WritableType<TShape>, Writeable<T>>;
// }

export function pick<TShape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Pick<TShape, K>, Pick<T, K>> {
  const result = {} as Pick<TShape, K>;

  for (const key of keys) {
    result[key] = objType.shape[key];
  }

  return obj(result as any) as unknown as ObjType<Pick<TShape, K>, Pick<T, K>>;
}

export function omit<TShape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Omit<TShape, K>, Omit<T, K>> {
  const result = { ...objType.shape };

  for (const key of keys) {
    delete result[key];
  }

  return obj(result as any) as unknown as ObjType<Omit<TShape, K>, Omit<T, K>>;
}

export function exclude<TMemberTypes extends Type, T, K extends Type[]>(
  unionType: UnionType<TMemberTypes, T>,
  ...types: K
) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => !types.find(k => areEqual(x, k))) };
  return union(result as UnionType<Exclude<TMemberTypes, ElementType<K>>, Exclude<T, TsType<ElementType<K>>>>);
}

export function extract<TMemberTypes extends Type, T, K extends Type[]>(
  unionType: UnionType<TMemberTypes, T>,
  ...keys: K
) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => keys.find(k => areEqual(x, k))) };
  return union(result as UnionType<Extract<TMemberTypes, ElementType<K>>, Extract<T, TsType<ElementType<K>>>>);
}
