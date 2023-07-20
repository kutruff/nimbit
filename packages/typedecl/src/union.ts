/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fail, never, Typ, type _type, type ElementType, type ParseResult, type TsType } from '.';

export interface IUnionType<TMembers extends unknown[]> {
  members: TMembers;
}

export class UnionType<TKind, TShape, T, TMembers extends unknown[]>
  extends Typ<TKind, TShape, T>
  implements IUnionType<TMembers>
{
  //Not athat members and shape are really the same object
  constructor(public members: TMembers, shape: TShape[], name?: string) {
    super(shape.map(x => (x as any).kind) as TKind, shape as TShape, name);
    this.unionTypes = shape as any;
    //TODO need to make sure the types are
  }

  parse(value: T, opts = Typ.defaultOpts): ParseResult<T> {
    for (const member of this.shape as Array<unknown>) {
      const result = (member as any).parse(value, opts);
      if (result.success) {
        return result;
      }
      // failedResults.push(result);
    }
    return fail();
  }
}

export function union<T extends Typ<unknown, unknown, unknown>[]>(
  ...args: T
): UnionType<ElementType<T>['kind'], ElementType<T>['shape'], TsType<ElementType<T>>, T> {
  // const flattenedMembers = flattenUnionMembers(args);
  // return new UnionType2([...new Set(flattenedMembers.map(x => x.kind))]) as any;
  return new UnionType(args, args) as any;
}

export function* flatIterateUnion(type: Typ): IterableIterator<Typ> {
  if (type.isUnion()) {
    for (const member of type.unionTypes) {
      yield* flatIterateUnion(member);
    }
  } else {
    yield type;
  }
}

export function unionIfNeeded<T extends Typ<unknown, unknown>[]>(
  types: T
): Typ<ElementType<T>['kind'], ElementType<T>['shape'], TsType<ElementType<T>>> | typeof never {
  return (types.length > 1 ? union(...types) : types.length === 1 ? types[0] : never) as any;
}

// export type UnpackUnion<T> = T extends [infer HeadA, ...infer TailA]
//   ? [UnpackUnion<HeadA>, ...UnpackUnion<TailA>]
//   : T extends IUnionType<infer K>
//   ? UnpackUnion<K>
//   : T;
// export type FlattenUnion<T> = FlattenDeep<UnpackUnion<T>>;

export type FlattenUnionMembers<T, Acc extends readonly unknown[] = []> = T extends IUnionType<infer U>
  ? FlattenUnionMembers<U, Acc>
  : T extends [infer F, ...infer R]
  ? FlattenUnionMembers<
      R,
      F extends readonly unknown[] | IUnionType<unknown[]> ? [...Acc, ...FlattenUnionMembers<F>] : [...Acc, F]
    >
  : Acc;

// export type FlattenUnion<T, Acc extends readonly unknown[] = []> = T extends IUnionType<infer U>
//   ? FlattenUnion<U, Acc>
//   : T extends [infer HeadA, ...infer TailA]
//   ? FlattenUnion<
//       TailA,
//       HeadA extends IUnionType<infer U>
//         ? FlattenUnion<U, Acc>
//         : [HeadA] extends [readonly unknown[]]
//         ? [...Acc, ...FlattenUnion<HeadA>]
//         : [...Acc, HeadA]
//     >
//   : Acc;

// export type FlattenUnion<T> = FlattenDeep<UnpackUnion<T>>;

export function flattenUnionMembers<T extends UnionType<unknown, unknown, unknown, unknown[]>>(
  union: T
): FlattenUnionMembers<T> {
  return [...flatIterateUnion(union)] as any;
}

export function flattenUnion<T extends UnionType<unknown, unknown, unknown, unknown[]>>(
  unionToFlatten: T
): UnionType<T['kind'], T['shape'], TsType<T>, FlattenUnionMembers<T>> {
  return union(...flattenUnionMembers(unionToFlatten));
}

// type UnnestTuple<A> = A extends [infer HeadA] ? (HeadA extends [infer H] ? UnnestTuple<H> : HeadA) : A;

// type FlattenTuple<A> = A extends [infer HeadA, ...infer TailA]
//   ? TailA extends []
//     ? [UnnestTupleWithSingleType<HeadA>]
//     : [UnnestTupleWithSingleType<HeadA>, ...FlattenTuple<TailA>]
//   : A;
// type FlattenTuple<A> = A extends [infer HeadA, ...infer TailA]
//   ? TailA extends []
//     ? [UnnestTuple<HeadA>]
//     : [UnnestTuple<HeadA>, ...FlattenTuple<TailA>]
//   : A;

// type FlattenTuple<A> = A extends []
//   ? []
//   : A extends [infer HeadA, ...infer TailA]
//   ? [UnnestTuple<HeadA>, ...FlattenTuple<TailA>]
//   : A;

// //Note, this will distribute over booleans, so don't use it for anything but higher level types
// type FlattenTuple<T> = T extends []
//   ? []
//   : T extends [infer T0]
//   ? [...FlattenTuple<T0>]
//   : T extends [infer T0, ...infer Ts]
//   ? [...FlattenTuple<T0>, ...FlattenTuple<Ts>]
//   : [T];

// https://stackoverflow.com/a/59833759
// type FlattenDeep<T extends readonly any[], A extends readonly any[] = []> = T extends [infer F, ...infer R]
//   ? FlattenDeep<R, F extends readonly any[] ? [...A, ...FlattenDeep<F>] : [...A, F]>
//   : A;

// type UnnestTuple<A, Acc extends unknown[] = []> = A extends [infer HeadA, ...infer TailA]
//   ? HeadA extends [infer H]
//     ? UnnestTuple<H, Acc>
//     : UnnestTuple<TailA, [...Acc, HeadA]>
//   : Acc;

// type UnnestTuple<A, Acc extends unknown[] = []> = A extends []
//   ? []
//   : A extends [infer H]
//   ? UnnestTuple<H, Acc>
//   : A extends [infer HeadA, ...infer TailA]
//   ? UnnestTuple<TailA, [...Acc, HeadA]>
//   : Acc;

// type UnnestTuple2<A, Acc extends unknown[] = []> = A extends [infer HeadA, ...infer TailA]
//   ? HeadA extends [infer H]
//     ? UnnestTuple<[H, ...TailA], Acc>
//     : UnnestTuple<TailA, [...Acc, HeadA]>
//   : Acc;

// type UnnestTupTest1 = UnnestTuple<[[[string]], number, [number]]>;
// type UnnestTupTest2 = UnnestTuple<[[[string, number]]]>;

// type FlatteTupTest1 = FlattenTuple<[[[string]], number, [number]]>;
// type FlatteTupTest2 = FlattenTuple<[[[string, string]]]>;

// export type ExtractRealUnionTypes<A> = A extends Typ<unknown, unknown, unknown, unknown>
//   ? A['realUnionTypes'] extends []
//     ? [A]
//     : ExtractRealUnionTypes<A['realUnionTypes']>
//   : A extends [infer HeadA, ...infer TailA]
//   ? [...ExtractRealUnionTypes<HeadA>, ...ExtractRealUnionTypes<TailA>]
//   : [];

// export type FlattenUnion<T, Acc extends readonly unknown[] = []> = T extends IUnionType<infer U>
//   ? FlattenUnion<U, Acc>
//   : [T] extends [[infer THead, ...infer TRest]]
//   ? FlattenUnion<
//       TRest,
//       THead extends IUnionType<infer THeadU>
//         ? FlattenUnion<THeadU, Acc>
//         : [THead] extends [readonly unknown[]]
//         ? [...Acc, ...FlattenUnion<THead>]
//         : [...Acc, THead]
//     >
//   : Acc;

// export function flattenUnion(
//   union: UnionType<unknown, unknown, unknown, unknown[]>
// ): ExtractRealUnionTypes<typeof union> {
//   return union.members;
// }

// function flattenUnionMembers<T extends Type<unknown, unknown>[]>(members: T) {
//   const flattened: Array<Type<unknown, unknown>> = [];
//   const visited = new WeakSet<Type>();

//   function visit(currentType: Type<unknown, unknown>) {
//     if (visited.has(currentType)) {
//       return;
//     }
//     visited.add(currentType);

//     if (currentType.kind === 'union') {
//       const union = currentType as UnionTypeOrig<Type<unknown, unknown>, unknown>;
//       union.memberTypes.forEach(visit);
//     } else {
//       flattened.push(currentType);
//     }
//   }
//   members.forEach(visit);

//   return flattened;
// }

//Required for type inference of the return type for the union() function
// export interface IUnionType<TMembers> extends Type<'union', unknown> {
//   memberTypes: TMembers[];
// }

// export type FlattenedUnion<T> = T extends IUnionType<infer K> ? FlattenedUnion<K> : T;

// function flattenUnionMembers<T extends Type<unknown, unknown>[]>(members: T) {
//   const flattened: Array<Type<unknown, unknown>> = [];
//   const visited = new WeakSet<Type>();

//   function visit(currentType: Type<unknown, unknown>) {
//     if (visited.has(currentType)) {
//       return;
//     }
//     visited.add(currentType);

//     if (currentType.kind === 'union') {
//       const union = currentType as UnionTypeOrig<Type<unknown, unknown>, unknown>;
//       union.memberTypes.forEach(visit);
//     } else {
//       flattened.push(currentType);
//     }
//   }
//   members.forEach(visit);

//   return flattened;
// }
