/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint no-use-before-define: 0 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  areEqual,
  flatIterateUnion,
  never,
  obj,
  unionIfNeeded,
  type _type,
  type ComparisonCache,
  type FlattenUnionMembers,
  type ObjType,
  type Shape,
  type TupleKeysToUnion,
  type Typ,
  type UnionType
} from '.';

// export type Intersect<A, B> = [A, B] extends [
//   infer A extends UnionType<unknown, unknown, unknown, unknown[]>,
//   infer B extends UnionType<unknown, unknown, unknown, unknown[]>
// ]
//   ? UnionType<
//       A['kind'] & B['kind'],
//       A['shape'] & B['shape'],
//       A[typeof _type] & B[typeof _type],
//       TuplifyUnion<
//         Intersect<
//           TupleKeysToUnion<FlattenUnionMembers<A['members']>>,
//           TupleKeysToUnion<FlattenUnionMembers<B['members']>>
//         >
//       >
//       // TupleExtract<
//       //   FlattenUnionMembers<[...A['members'], ...B['members']]>,
//       //   TupleKeysToUnion<FlattenUnionMembers<A['members']>> & TupleKeysToUnion<FlattenUnionMembers<B['members']>>
//       // >
//     >
//   : // : [A, B] extends [
//   //     infer A extends Typ<unknown, unknown, unknown>,
//   //     infer B extends UnionType<unknown, unknown, unknown, unknown[]>
//   //   ]
//   // ? UnionType<
//   //     A['kind'] & B['kind'],
//   //     A['shape'] & B['shape'],
//   //     A[typeof _type] & B[typeof _type],
//   //     TupleExtract<FlattenUnionMembers<[A, ...B['members']]>, A & TupleKeysToUnion<FlattenUnionMembers<B['members']>>>
//   //   >
//   [A, B] extends [infer A extends Typ<unknown, unknown, unknown>, infer B extends Typ<unknown, unknown, unknown>]
//   ? A['kind'] & B['kind'] extends 'object'
//     ? Typ<
//         'object',
//         Omit<A['shape'] & B['shape'], keyof A['shape'] & keyof B['shape']> & {
//           [P in keyof A['shape'] & keyof B['shape']]: Intersect<A['shape'][P], B['shape'][P]>;
//         },
//         A[typeof _type] & B[typeof _type]
//       >
//     : Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
//   : A & B;
// type fooo = UnionType<unknown, unknown, unknown, unknown> extends Typ<unknown, unknown, unknown> ? true : false;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

type TuplifyUnion<T, L = LastOf<T>, Acc extends unknown[] = [], N = [T] extends [never] ? true : false> = true extends N
  ? Acc
  : TuplifyUnion<Exclude<T, L>, LastOf<Exclude<T, L>>, [L, ...Acc]>;

// TS4.0+
type Push<T extends any[], V> = [...T, V];

// TS4.1+
// type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> =
//   true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

type abc = 'a' | 'b' | 'c';
type t = TuplifyUnion<abc>; // ["a", "b", "c"]
type adaghdagag = (string | number) & number;

export type Intersect<A, B> = [A, B] extends [
  infer A extends UnionType<unknown, unknown, unknown, unknown[]>,
  infer B extends UnionType<unknown, unknown, unknown, unknown[]>
]
  ? UnionType<
      A['kind'] & B['kind'],
      A['shape'] & B['shape'],
      A[typeof _type] & B[typeof _type],
      TuplifyUnion<
        Intersect<
          TupleKeysToUnion<FlattenUnionMembers<A['members']>>,
          TupleKeysToUnion<FlattenUnionMembers<B['members']>>
        >
      >
    >
  : [A, B] extends [
      infer A extends Typ<unknown, unknown, unknown>,
      infer B extends UnionType<unknown, unknown, unknown, unknown[]>
    ]
  ? UnionType<
      A['kind'] & B['kind'],
      A['shape'] & B['shape'],
      A[typeof _type] & B[typeof _type],
      TuplifyUnion<Intersect<A, TupleKeysToUnion<FlattenUnionMembers<B['members']>>>>
    >
  : [A, B] extends [
      infer A extends UnionType<unknown, unknown, unknown, unknown[]>,
      infer B extends Typ<unknown, unknown, unknown>
    ]
  ? UnionType<
      A['kind'] & B['kind'],
      A['shape'] & B['shape'],
      A[typeof _type] & B[typeof _type],
      TuplifyUnion<Intersect<TupleKeysToUnion<FlattenUnionMembers<A['members']>>, B>>
    >
  : [A, B] extends [infer A extends ObjType<unknown, unknown>, infer B extends ObjType<unknown, unknown>]
  ? Typ<
      'object',
      Omit<A['shape'] & B['shape'], keyof A['shape'] & keyof B['shape']> & {
        [P in keyof A['shape'] & keyof B['shape']]: Intersect<A['shape'][P], B['shape'][P]>;
      },
      A[typeof _type] & B[typeof _type]
    >
  : [A, B] extends [infer A extends Typ<unknown, unknown, unknown>, infer B extends Typ<unknown, unknown, unknown>]
  ? Typ<A['kind'] & B['kind'], A['shape'] & B['shape'], A[typeof _type] & B[typeof _type]>
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
        const result = intersection(propertyA as any, propertyB as any, cache) as any;
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
    const aMembers = [...flatIterateUnion(typeA)];
    const bMembers = [...flatIterateUnion(typeB)];

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

    return unionIfNeeded(results);
  }

  return (areEqual(typeA as any, typeB as any, cache) ? typeB : never) as any;
}
