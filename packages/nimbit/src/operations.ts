/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  flatIterateUnion,
  obj,
  undef,
  union,
  unionIfNeeded,
  type _type,
  type FlattenUnionMembers,
  type IUnionType,
  type never,
  type ObjShapeDefinition,
  type ObjType,
  type ObjTypShape,
  type Resolve,
  type ShapeDefinitionToObjType,
  type ToUnionMemberList,
  type TupleValuesToUnion,
  type Typ,
  type UndefinedT,
  type UnionFlattenedOrSingle,
  type UnionOrSingle,
  type UnionType
} from '.';


export type TupleExclude<T, TExclude, Acc extends any[] = []> = T extends [infer Head, ...infer Tail]
  ? Exclude<Head, TExclude> extends never
    ? TupleExclude<Tail, TExclude, Acc>
    : TupleExclude<Tail, TExclude, [...Acc, Head]>
  : Acc;

export type TupleExtract<T, TExtract, Acc extends any[] = []> = T extends [infer Head, ...infer Tail]
  ? Extract<Head, TExtract> extends never
    ? TupleExtract<Tail, TExtract, Acc>
    : TupleExtract<Tail, TExtract, [...Acc, Head]>
  : Acc;

type ExcludeFlattenedUnionMembers<T, U extends Typ[]> = TupleExclude<
  FlattenUnionMembers<[T]>,
  ToBaseKind<TupleValuesToUnion<FlattenUnionMembers<U>>>
>;

export type ExcludeFlattenedType<
  T,
  U extends Typ[],
  TUnionExcluded = ExcludeFlattenedUnionMembers<T, U>
> = TUnionExcluded extends [] ? typeof never : UnionFlattenedOrSingle<TUnionExcluded>;

type ExcludeUnionMembers<T, U extends Typ[]> = TupleExclude<
  ToUnionMemberList<T>,
  ToBaseKind<TupleValuesToUnion<FlattenUnionMembers<U>>>
>;

export type ExcludeType<T, U extends Typ[], TUnionExcluded = ExcludeUnionMembers<T, U>> = TUnionExcluded extends []
  ? typeof never
  : UnionOrSingle<TUnionExcluded>;

//TODO: This makes the type broad to just the kind.  If this were removed, all the above typings would work based on full type and not just kind
type ToBaseKind<T> = T extends Typ<infer TKind, unknown, unknown> ? Typ<TKind, unknown, unknown> : never;

export function flatExcludeKinds<T extends Typ, U extends Typ[]>(typesT: T, ...typesU: U): ExcludeFlattenedType<T, U> {
  return excludeTypesFromTypes([...flatIterateUnion(typesT)], typesU);
}

export function excludeKinds<T extends Typ, U extends Typ[]>(typeT: T, ...typesU: U): ExcludeType<T, U> {
  const typesT = typeT.isUnion() ? (typeT as unknown as IUnionType<any>).members : [typeT];

  return excludeTypesFromTypes(typesT, typesU);
}

function excludeTypesFromTypes<T extends Typ[], U extends Typ[]>(typesT: T, typesU: U) {
  const flatTypesU = typesU.flatMap(x => [...flatIterateUnion(x)]);
  // return unionIfNeeded(typesT.filter(typeT => typesUFlattened.find(typeU => areEqual(typeT, typeU)) === undefined));
  const result = [];
  for (const elementT of typesT) {
    let didFindMatch = false;
    for (const typeU of flatTypesU) {
      // if (areEqual(elementT, typeU)) {
      if (elementT.kind === typeU.kind) {
        didFindMatch = true;
        break;
      }
    }
    if (!didFindMatch) {
      result.push(elementT);
    }
  }
  return unionIfNeeded(result) as any;
}

type ExtractFlattenedUnionMembers<T, U extends Typ[]> = TupleExtract<
  FlattenUnionMembers<[T]>,
  TupleValuesToUnion<FlattenUnionMembers<U>>
>;

export type ExtractFlattenedType<
  T,
  U extends Typ[],
  TUnionExtracted = ExtractFlattenedUnionMembers<T, U>
> = TUnionExtracted extends [] ? typeof never : UnionFlattenedOrSingle<TUnionExtracted>;

export type ExtractUnionMembers<T, U extends Typ[]> = TupleExtract<
  ToUnionMemberList<T>,
  TupleValuesToUnion<FlattenUnionMembers<U>>
>;

export type ExtractType<T, U extends Typ[], TUnionExtracted = ExtractUnionMembers<T, U>> = TUnionExtracted extends []
  ? typeof never
  : UnionOrSingle<TUnionExtracted>;

// export function flatExtract<T extends Typ, U extends Typ[]>(typesT: T, ...typesU: U): ExtractFlattenedType<T, U> {
//   return extractTypesFromTypes([...flatIterateUnion(typesT)], typesU);
// }

// export function extract<T extends Typ, U extends Typ[]>(typeT: T, ...typesU: U): ExtractType<T, U> {
//   const typesT = typeT.isUnion() ? (typeT as unknown as IUnionType<any>).members : [typeT];

//   return extractTypesFromTypes(typesT, typesU);
// }

// function extractTypesFromTypes<T extends Typ[], U extends Typ[]>(typesT: T, typesU: U) {
//   const foundMembers = [];
//   const flatTypesU = typesU.flatMap(x => [...flatIterateUnion(x)]);
//   for (const typeT of typesT) {
//     for (const typeU of flatTypesU) {
//       if (areEqual(typeT, typeU)) {
//         foundMembers.push(typeT);
//         break;
//       }
//     }
//   }

//   return unionIfNeeded(foundMembers);
// }
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
