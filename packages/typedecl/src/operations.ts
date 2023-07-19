/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  areEqual,
  flattenUnionGen,
  never,
  obj,
  undef,
  union,
  unionIfNeeded,
  type _type,
  type ComparisonCache,
  type ElementType,
  type ObjType,
  type Resolve,
  type Shape,
  type Typ
} from '.';

// type NeverToUndefined<T> = [T] extends [never] ? undefined : T;

// export type IntersectOriginallyWorking<A, B> = A extends Typ<unknown, unknown, unknown>
//   ? B extends Typ<unknown, unknown, unknown>
//     ? A extends Typ<'object', unknown, unknown>
//       ? B extends Typ<'object', unknown, unknown>
//         ? Typ<
//             'object',
//             Omit<A['shape'] & B['shape'], keyof A['shape'] & keyof B['shape']> & {
//               [P in keyof A['shape'] & keyof B['shape']]: Intersect<A['shape'][P], B['shape'][P]>;
//             },
//             A[typeof _type] & B[typeof _type]
//           >
//         : Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
//       : Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
//     : A & B
//   : A & B;

export type Intersect<A, B> = A extends Typ<unknown, unknown, unknown>
  ? B extends Typ<unknown, unknown, unknown>
    ? A['kind'] & B['kind'] extends 'object'
      ? Typ<
          'object',
          Omit<A['shape'] & B['shape'], keyof A['shape'] & keyof B['shape']> & {
            [P in keyof A['shape'] & keyof B['shape']]: Intersect<A['shape'][P], B['shape'][P]>;
          },
          A[typeof _type] & B[typeof _type]
        >
      : Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
    : A & B
  : A & B;

export function intersection<TA extends Typ<unknown, unknown, unknown>, TB extends Typ<unknown, unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache
): Intersect<TA, TB> {
  if ((typeA as any) === (typeB as any)) {
    return typeB as any;
  }
  if (typeA.kind === 'any') {
    return typeA as any;
  }
  if (typeB.kind === 'any') {
    return typeB as any;
  }

  if (typeA.kind === 'object' && typeB.kind === 'object') {
    const merged = {} as Shape;

    const shapeA = typeA.shape as Shape;
    const shapeB = typeB.shape as Shape;
    const allKeysInAB = new Set(Object.keys(shapeA).concat(Object.keys(shapeB)));

    for (const key of allKeysInAB) {
      const propertyA = shapeA[key];
      const propertyB = shapeB[key];

      if (propertyA != null && propertyB != null) {
        const result = intersection(propertyA as any, propertyB as any, cache);
        if (result.kind === 'never') {
          return never as any;
        }
        merged[key] = result;
      } else {
        merged[key] = (propertyA || propertyB)!;
      }
    }
    return obj(merged) as any;
  }

  if (typeA.isUnion() || typeB.isUnion()) {
    const aMembers = [...flattenUnionGen(typeA)];
    const bMembers = [...flattenUnionGen(typeB)];

    const equalTypes = new Set<Typ<unknown, unknown>>();
    for (const aMember of aMembers) {
      for (const bMember of bMembers) {
        //TODO: Need a better way to handle this.  Recursive types could break.
        const intersected = intersection(aMember, bMember, cache);
        if (intersected.kind !== 'never') {
          // console.log('intersected', intersected);
          equalTypes.add(intersected);
        }
      }
    }

    const results = [...equalTypes.values()];

    return unionIfNeeded(results) as any;
  }

  return (areEqual(typeA as any, typeB as any, cache) ? typeB : never) as any;
}

export type Extend<TA, TB> = Omit<TA, keyof TB> & TB;

//TODO: figure out why this resolve is required for assignment checks in the unit test
export function extend<TObjA extends ObjType<unknown, unknown>, TObjB extends ObjType<unknown, unknown>>(
  objectTypeA: TObjA,
  objectTypeB: TObjB
): ObjType<Resolve<Extend<TObjA['shape'], TObjB['shape']>>, Resolve<Extend<TObjA[typeof _type], TObjB[typeof _type]>>> {
  return obj({ ...(objectTypeA as any).shape, ...(objectTypeB as any).shape }) as any;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Typ<unknown, unknown>
    ? Typ<T[P]['kind'] | 'undefined', T[P]['shape'] | undefined, T[P][typeof _type] | undefined>
    : never;
};

export function partial<TShape, T>(objType: ObjType<TShape, T>): ObjType<PartialType<TShape>, Partial<T>> {
  const result = {} as Shape;
  const shape = objType.shape as Shape;
  for (const key of Object.keys(shape)) {
    result[key] = union(shape[key] as any, undef);
  }

  return obj(result) as any;
}

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Typ<unknown, unknown>
    ? Typ<Exclude<T[P]['kind'], 'undefined'>, Exclude<T[P]['shape'], undefined>, Exclude<T[P][typeof _type], undefined>>
    : never;
};

export function required<TShape, T>(objType: ObjType<TShape, T>): ObjType<RequiredType<TShape>, Required<T>> {
  const result = {} as Shape;
  const shape = objType.shape as Shape;
  for (const key of Object.keys(shape)) {
    result[key] = exclude(shape[key] as any, undef);
  }
  return obj(result) as any;
}

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

  //TODO: should strictness be preserved?
  return obj(result as any) as any;
}

export function exclude<T extends Typ, U extends Typ[]>(
  typesT: T,
  ...typesU: U
): Exclude<T['kind'], ElementType<U>['kind']> extends never
  ? typeof never
  : Typ<
      Exclude<T['kind'], ElementType<U>['kind']>,
      Exclude<T['shape'], ElementType<U>['shape']>,
      Exclude<T[typeof _type], ElementType<U>[typeof _type]>
    > {
  const notExcluded = [];
  for (const typeT of flattenUnionGen(typesT)) {
    let didFindMatchingMember = false;
    for (const typeU of typesU.flatMap(x => [...flattenUnionGen(x)])) {
      if (areEqual(typeT, typeU)) {
        didFindMatchingMember = true;
        break;
      }
    }
    if (!didFindMatchingMember) {
      notExcluded.push(typeT);
    }
  }
  return unionIfNeeded(notExcluded) as any;
}

export function extract<T extends Typ, U extends Typ[]>(
  typesT: T,
  ...typesU: U
): Extract<T['kind'], ElementType<U>['kind']> extends never
  ? typeof never
  : Typ<
      Extract<T['kind'], ElementType<U>['kind']>,
      Extract<T['shape'], ElementType<U>['shape']>,
      Extract<T[typeof _type], ElementType<U>[typeof _type]>
    > {
  const foundMembers = [];
  for (const typeT of flattenUnionGen(typesT)) {
    for (const typeU of typesU.flatMap(x => [...flattenUnionGen(x)])) {
      if (areEqual(typeT, typeU)) {
        foundMembers.push(typeT);
        break;
      }
    }
  }
  return unionIfNeeded(foundMembers) as any;
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
