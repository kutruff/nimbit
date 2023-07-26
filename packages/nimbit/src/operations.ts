/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  areEqual,
  flatIterateUnion,
  obj,
  undef,
  union,
  unionIfNeeded,
  type _type,
  type FlattenUnionMembers,
  type IUnionType,
  type never,
  type ObjType,
  type Resolve,
  type Shape,
  type ShapeDefinition,
  type ShapeDefinitionToObjType,
  type ToUnionMemberList,
  type TupleKeysToUnion,
  type Typ,
  type UndefinedT,
  type UnionFlattenedOrSingle,
  type UnionOrSingle,
  type UnionType
} from '.';

export type Extend<TA, TB> = Resolve<Omit<TA, keyof TB> & TB>;

//TODO: figure out why this resolve is required for assignment checks in the unit test
export function merge<TObjA extends ObjType<unknown, unknown>, TObjB extends ObjType<unknown, unknown>>(
  objectTypeA: TObjA,
  objectTypeB: TObjB
): ObjType<Extend<TObjA['shape'], TObjB['shape']>, Extend<TObjA[typeof _type], TObjB[typeof _type]>> {
  return obj({ ...(objectTypeA as any).shape, ...(objectTypeB as any).shape }, undefined, objectTypeB.propertyPolicy) as any;
}

//TODO: figure out why this resolve is required for assignment checks in the unit test
export function extend<
  TObjA extends ObjType<unknown, unknown>,
  TShapeDefinition extends ShapeDefinition,
  TObjB extends ObjType<unknown, unknown> = ShapeDefinitionToObjType<TShapeDefinition>
>(
  objectTypeA: TObjA,
  shape: TShapeDefinition
): ObjType<Extend<TObjA['shape'], TObjB['shape']>, Extend<TObjA[typeof _type], TObjB[typeof _type]>> {
  return obj({ ...(objectTypeA as any).shape, ...shape }) as any;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Typ<unknown, unknown>
    ? UnionType<
        T[P]['kind'] | 'undefined',
        T[P]['shape'] | undefined,
        T[P][typeof _type] | undefined,
        [T[P], UndefinedT]
      >
    : never;
};

export function partial<TShape, T>(objType: ObjType<TShape, T>): ObjType<PartialType<TShape>, Partial<T>>;
export function partial<TShape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Extend<TShape, PartialType<Pick<TShape, K>>>, Extend<T, Partial<Pick<T, K>>>>;
export function partial<TShape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<PartialType<TShape>, Partial<T>> {
  const result = {} as Shape;
  const source = (keys.length === 0 ? objType.shape : pickProps(objType, keys)) as Shape;

  for (const key of Object.keys(source)) {
    result[key] = union(source[key] as any, undef);
  }

  return obj({ ...objType.shape, ...result }) as any;
}

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Typ<unknown, unknown> ? ExcludeFlattenedType<T[P], [UndefinedT]> : never;
};

export function required<TShape, T>(objType: ObjType<TShape, T>): ObjType<RequiredType<TShape>, Required<T>>;
export function required<TShape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Extend<TShape, RequiredType<Pick<TShape, K>>>, Extend<T, Required<Pick<T, K>>>>;
export function required<TShape, K extends keyof TShape & keyof T, T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<RequiredType<TShape>, Required<T>> {
  const result = {} as Shape;
  const source = (keys.length === 0 ? objType.shape : pickProps(objType, keys)) as Shape;

  for (const key of Object.keys(source)) {
    result[key] = flatExcludeKinds(source[key] as any, undef);
  }

  return obj({ ...objType.shape, ...result }) as any;
}

export function pick<TShape, T, K extends keyof TShape & keyof T>(
  objType: ObjType<TShape, T>,
  ...keys: Array<K>
): ObjType<Pick<TShape, K>, Pick<T, K>> {
  const result = pickProps<TShape, T, K>(objType, keys);

  return obj(result as any) as unknown as ObjType<Pick<TShape, K>, Pick<T, K>>;
}

function pickProps<TShape, T, K extends keyof TShape & keyof T>(objType: ObjType<TShape, T>, keys: K[]) {
  const result = {} as Pick<TShape, K>;

  for (const key of keys) {
    result[key] = objType.shape[key];
  }
  return result;
}

export function omit<TShape, T, K extends keyof TShape & keyof T>(
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
  ToBaseKind<TupleKeysToUnion<FlattenUnionMembers<U>>>
>;

export type ExcludeFlattenedType<
  T,
  U extends Typ[],
  TUnionExcluded = ExcludeFlattenedUnionMembers<T, U>
> = TUnionExcluded extends [] ? typeof never : UnionFlattenedOrSingle<TUnionExcluded>;

type ExcludeUnionMembers<T, U extends Typ[]> = TupleExclude<
  ToUnionMemberList<T>,
  ToBaseKind<TupleKeysToUnion<FlattenUnionMembers<U>>>
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
  const notExcluded = [];
  for (const elementT of typesT) {
    let didFindMatchingMember = false;
    for (const typeU of flatTypesU) {
      // if (areEqual(elementT, typeU)) {
      if (elementT.kind === typeU.kind) {
        didFindMatchingMember = true;
        break;
      }
    }
    if (!didFindMatchingMember) {
      notExcluded.push(elementT);
    }
  }
  return unionIfNeeded(notExcluded) as any;
}

type ExtractFlattenedUnionMembers<T, U extends Typ[]> = TupleExtract<
  FlattenUnionMembers<[T]>,
  TupleKeysToUnion<FlattenUnionMembers<U>>
>;

export type ExtractFlattenedType<
  T,
  U extends Typ[],
  TUnionExtracted = ExtractFlattenedUnionMembers<T, U>
> = TUnionExtracted extends [] ? typeof never : UnionFlattenedOrSingle<TUnionExtracted>;

export type ExtractUnionMembers<T, U extends Typ[]> = TupleExtract<
  ToUnionMemberList<T>,
  TupleKeysToUnion<FlattenUnionMembers<U>>
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
