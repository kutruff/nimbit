/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectType } from 'typescript';

import {
  areEqual,
  flattenUnionGen,
  never,
  number,
  obj,
  objOrig,
  undef,
  union,
  unionOrig,
  type _type,
  type ComparisonCache,
  type ElementType,
  type FlattenedUnion,
  type IUnionType,
  type ObjType,
  type ObjTypeOrig,
  type Resolve,
  type Shape,
  type ToTsTypes,
  type TsType,
  type Typ,
  type Type,
  type UnionToIntersection,
  type UnionType,
  type UnionTypeOrig
} from '.';

type NeverToUndefined<T> = [T] extends [never] ? undefined : T;

export type IntersectOriginallyWorking<A, B> = A extends Typ<unknown, unknown, unknown>
  ? B extends Typ<unknown, unknown, unknown>
    ? A extends Typ<'object', unknown, unknown>
      ? B extends Typ<'object', unknown, unknown>
        ? Typ<
            'object',
            Omit<A['shape'] & B['shape'], keyof A['shape'] & keyof B['shape']> & {
              [P in keyof A['shape'] & keyof B['shape']]: Intersect<A['shape'][P], B['shape'][P]>;
            },
            A[typeof _type] & B[typeof _type]
          >
        : Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
      : Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
    : A & B
  : A & B;

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

export type FlattenMaybe<TA> = TA extends Typ<infer AKind, infer AShape, infer AType> ? Typ<AKind, AShape, AType> : TA;

export function intersection<TA extends Typ<unknown, unknown, unknown>, TB extends Typ<unknown, unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache //: TA & TB { //: TA & TB {
  // ): Typ<TA['kind'] & TB['kind'], TA['shape'] & TB['shape'], TA[typeof _type] & TB[typeof _type]> {
): Intersect<TA, TB> {
  // console.log('intersecting: ', typeA.kind, typeB.kind);
  if ((typeA as any) === (typeB as any)) {
    // console.log('intersected!');
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
    // console.log('results', results.map(x => x.kind).join(', '));
    return (results.length > 1 ? union(...results) : results.length === 1 ? results[0] : never) as any;
  }

  if (areEqual(typeA as any, typeB as any, cache)) {
    // console.log('equal', (typeA as any) === (typeB as any));
    return typeB as any;
  }
  // console.log('never', typeA.kind, typeB.kind);
  return never as any;

  // const aKinds = new Set(aMembers.map(x => x.kind));
  // const overlappingKinds = new Set(bMembers.filter(x => aKinds.has(x.kind)).map(x => x.kind));
  // const matchingMembers = [
  //   ...aMembers.filter(x => overlappingKinds.has(x.kind), ...bMembers.filter(x => overlappingKinds.has(x.kind)))
  // ];
}
type asdfagd = (string | { prop: string }) & (string | { prop: string; prop2: number });
const adjlknkasdf: asdfagd = { prop: 'hllo', prop2: 1 };
const adjlknk: asdfagd = 'hello';

export type ObjIntersection<TA, TB> = TA extends ObjType<unknown, unknown>
  ? TB extends ObjType<unknown, unknown>
    ? ObjType<TA['shape'] & TB['shape'], TA[typeof _type] & TB[typeof _type]>
    : never
  : never;

// export type ObjIntersection<TA, TB> = TA extends ObjType<unknown, unknown>
//   ? TB extends ObjType<unknown, unknown>
//     ? ObjType<TA['shape'] & TB['shape'], TA[typeof _type] & TB[typeof _type]>
//     : never
//   : never;

export function intersectionOrig<TA extends ObjTypeOrig<unknown, unknown>, TB extends ObjTypeOrig<unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache
): ObjTypeOrig<TA['shape'] & TB['shape'], TA[typeof _type] & TB[typeof _type]>;
export function intersectionOrig<
  TA extends UnionTypeOrig<unknown, unknown>,
  TB extends UnionTypeOrig<unknown, unknown>
>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache
): UnionTypeOrig<FlattenedUnion<TA> & FlattenedUnion<TB>, TsType<TA> & TsType<TB>>;
export function intersectionOrig<TA extends UnionTypeOrig<unknown, unknown>, TB extends Type<unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache
): UnionTypeOrig<FlattenedUnion<TA> & TB, TsType<TA> & TsType<TB>>;
export function intersectionOrig<TA extends Type<unknown, unknown>, TB extends UnionTypeOrig<unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache
): UnionTypeOrig<TA & FlattenedUnion<TB>, TsType<TA> & TsType<TB>>;
export function intersectionOrig<TA extends Type<unknown, unknown>, TB extends Type<unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache?: ComparisonCache
): TA extends TB ? (TB extends TA ? TA : never) : never;
export function intersectionOrig<TA extends Type<unknown, unknown>, TB extends Type<unknown, unknown>>(
  typeA: TA,
  typeB: TB,
  cache: ComparisonCache = new WeakMap()
): any {
  if ((typeA as any) === (typeB as any)) {
    return typeB;
  }
  if (typeA.kind === 'any') {
    return typeA as any;
  }
  if (typeB.kind === 'any') {
    return typeB as any;
  }

  if (typeA.kind === 'object' && typeB.kind === 'object') {
    const merged = {} as Shape;

    const shapeA = (typeA as unknown as ObjTypeOrig<unknown, unknown>).shape as Shape;
    const shapeB = (typeB as unknown as ObjTypeOrig<unknown, unknown>).shape as Shape;
    const allKeysInAB = new Set(Object.keys(shapeA).concat(Object.keys(shapeB)));

    for (const key of allKeysInAB) {
      const propertyA = shapeA[key];
      const propertyB = shapeB[key];

      if (propertyA != null && propertyB != null) {
        merged[key] = intersection(propertyA as any, propertyB as any, cache);
      } else {
        merged[key] = (propertyA || propertyB)!;
      }
    }
    return obj(merged) as any;
  }

  if (typeA.kind === 'union' || typeB.kind === 'union') {
    const aMembers = (
      typeA.kind === 'union' ? (typeA as unknown as IUnionType<Type<string, unknown>>).memberTypes : [typeA]
    ) as Type<string, unknown>[];
    const bMembers = (
      typeB.kind === 'union' ? (typeB as unknown as IUnionType<Type<string, unknown>>).memberTypes : [typeB]
    ) as Type<string, unknown>[];

    const intersected: any = {};
    const equalTypes = new Set<Type<unknown, unknown>>();
    for (const aMember of aMembers) {
      for (const bMember of bMembers) {
        //TODO: Need a better way to handle this.  Recursive types could break.

        // if (aMember !== typeA && bMember !== typeB) {
        const intersected = intersectionOrig(aMember, bMember, cache);
        if (intersected.kind !== 'never') {
          console.log('intersected', intersected);
          equalTypes.add(intersected);
        }
        // }
      }
    }

    return (equalTypes.size > 0 ? unionOrig(...equalTypes.values()) : union(never)) as any;
  }
  // const aKinds = new Set(aMembers.map(x => x.kind));
  // const overlappingKinds = new Set(bMembers.filter(x => aKinds.has(x.kind)).map(x => x.kind));
  // const matchingMembers = [
  //   ...aMembers.filter(x => overlappingKinds.has(x.kind), ...bMembers.filter(x => overlappingKinds.has(x.kind)))
  // ];

  if (areEqual(typeA as any, typeB as any, cache)) {
    console.log('equal', (typeA as any) === (typeB as any));
    return unionOrig(typeA, typeB) as any;
  } else {
    console.log('never', typeA, typeB);
    return never as any;
  }
}

export function intersectObj<TObjA extends ObjTypeOrig<unknown, unknown>, TObjB extends ObjTypeOrig<unknown, unknown>>(
  objectTypeA: TObjA,
  objectTypeB: TObjB
): ObjTypeOrig<TObjA['shape'] & TObjB['shape'], TObjA[typeof _type] & TObjB[typeof _type]> {
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
        if (propertyA.kind === 'union' || propertyB.kind === 'union') {
          const aMembers = (
            propertyA.kind === 'union' ? (propertyA as IUnionType<Type<string, unknown>>).memberTypes : [propertyA]
          ) as Type<string, unknown>[];
          const bMembers = (
            propertyB.kind === 'union' ? (propertyB as IUnionType<Type<string, unknown>>).memberTypes : [propertyB]
          ) as Type<string, unknown>[];

          const aKinds = new Set(aMembers.map(x => x.kind));
          const overlappingKinds = new Set(bMembers.filter(x => aKinds.has(x.kind)).map(x => x.kind));
          const matchingProps = [
            ...aMembers.filter(x => overlappingKinds.has(x.kind), ...bMembers.filter(x => overlappingKinds.has(x.kind)))
          ];
          // console.log(aKinds);
          // console.log(overlappingKinds);
          // console.log(matchingProps);
          merged[key] = matchingProps.length === 0 ? never : unionOrig(...matchingProps);
        } else {
          switch (propertyA.kind) {
            case 'object': {
              if (propertyB.kind !== 'object') {
                merged[key] = never;
              } else {
                merged[key] = intersection(propertyA as any, propertyB as any);
              }
              break;
            }

            default: {
              //TODO: what happens with optional and readonly props?
              if (areEqual(propertyA as any, propertyB as any)) {
                merged[key] = propertyB;
              } else {
                merged[key] = never;
              }
              break;
            }
          }
        }
      }
    }
  }

  return obj(merged) as unknown as any;
}

export type Extend<TA, TB> = Omit<TA, keyof TB> & TB;

// export type ObjExtend<TObjA extends ObjType<unknown, unknown>, TObjB extends ObjType<unknown, unknown>> = ObjType<
//   Extend<TObjA['shape'], TObjB['shape']>,
//   Extend<TObjA[typeof _type], TObjB[typeof _type]>
// >;

// export function merge<TShapeA, TsTypeA, TShapeB, TsTypeB>(
//   objectTypeA: ObjType<TShapeA, TsTypeA>,
//   objectTypeB: ObjType<TShapeB, TsTypeB>
// ): ObjMerge<typeof objectTypeA, typeof objectTypeB> {
//   return obj({ ...objectTypeA.shape, ...objectTypeB.shape } as any) as any;
// }

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

// type RemoveUnionUndef<T> = T extends UnionTypeOrig<infer U, unknown>
//   ? UnionTypeOrig<FlattenedUnion<Exclude<U, typeof undef>>, ToTsTypes<Exclude<U, typeof undef>>>
//   : T;

// export type RequiredTypeOrig<T> = {
//   [P in keyof T]: RemoveUnionUndef<T[P]>;
// };

// export function requiredOrig<TShape, T>(
//   objType: ObjTypeOrig<TShape, T>
// ): ObjTypeOrig<RequiredTypeOrig<TShape>, ToTsTypes<RequiredTypeOrig<TShape>>> {
//   const result = {} as Shape;

//   const shape = objType.shape as Shape;
//   for (const key of Object.keys(shape)) {
//     const type = shape[key]!;
//     const madeRequired = type.kind !== 'union' ? type : exclude(type as any, undef);
//     result[key] = madeRequired;
//   }

//   return objOrig(result) as unknown as ObjTypeOrig<RequiredTypeOrig<TShape>, ToTsTypes<RequiredTypeOrig<TShape>>>;
// }

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

  //TODO: should strictness be preserved?
  return obj(result as any) as unknown as ObjType<Omit<TShape, K>, Omit<T, K>>;
}

// export function exclude<TMemberTypes extends Type, T, K extends Type[]>(
//   unionType: UnionTypeOrig<TMemberTypes, T>,
//   ...types: K
// ) {
//   const result = {
//     ...unionType,
//     memberTypes: unionType.memberTypes.filter(x => !types.find(k => areEqual(x as any, k as any)))
//   };
//   return unionOrig(result as UnionTypeOrig<Exclude<TMemberTypes, ElementType<K>>, Exclude<T, TsType<ElementType<K>>>>);
// }

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
  return (notExcluded.length > 1 ? union(...notExcluded) : notExcluded.length === 1 ? notExcluded[0] : never) as any;
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
  return (
    foundMembers.length > 1 ? union(...foundMembers) : foundMembers.length === 1 ? foundMembers[0] : never
  ) as any;
}
