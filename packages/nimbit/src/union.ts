/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  excludeKinds,
  fail,
  never,
  nul,
  Typ,
  undef,
  type _type,
  type ElementType,
  type ExcludeType,
  type IsLengthOneTuple,
  type ParseError,
  type ParseResult,
  type TsType
} from '.';

export interface IUnionType<TMembers> {
  members: TMembers;
}

export type CreateUnionFromTypes<TMembers> = TMembers extends Typ[]
  ? UnionType<TMembers, ElementType<TMembers>[typeof _type]>
  : never;

export type FlattenUnionMembers<T, Acc extends readonly unknown[] = []> = T extends IUnionType<infer U>
  ? FlattenUnionMembers<U, Acc>
  : T extends [infer F, ...infer R]
  ? FlattenUnionMembers<
      R,
      F extends readonly unknown[] | IUnionType<unknown[]> ? [...Acc, ...FlattenUnionMembers<F>] : [...Acc, F]
    >
  : Acc;

export type UnionFlattenedOrSingle<T, TMembers = FlattenUnionMembers<T>> = IsLengthOneTuple<TMembers> extends never
  ? T extends Typ[]
    ? CreateUnionFromTypes<T>
    : T extends Typ
    ? T
    : never
  : IsLengthOneTuple<TMembers>;

export type ToUnionMemberList<T> = T extends IUnionType<infer TMembers>
  ? TMembers
  : T extends [infer _THead, ...infer _TRest]
  ? T
  : [T];

export type UnionOrSingle<T, TMembers = ToUnionMemberList<T>> = IsLengthOneTuple<TMembers> extends never
  ? T extends Typ[]
    ? CreateUnionFromTypes<T>
    : T extends Typ
    ? T
    : never
  : IsLengthOneTuple<TMembers>;

export class UnionType<TMembers, T> extends Typ<'union', TMembers, T> implements IUnionType<TMembers> {
  //Note that members and shape are really the same object
  constructor(public members: TMembers, name?: string) {
    super('union', members, name);
    // this.unionTypes = shape as any;
  }

  isUnion(): boolean {
    return true;
  }

  //TODO: test
  unwrap(): ExcludeType<TMembers, [Typ<'undefined', unknown, unknown>, Typ<'null', unknown, unknown>]> {
    return excludeKinds(this, undef, nul) as any;
  }

  safeParse(value: unknown): ParseResult<T> {
    const errors: ParseError[] = [];

    for (const member of this.shape as Array<Typ<unknown, unknown, T>>) {
      const result = member.safeParse(value);
      if (result.success) {
        return result;
      }
      errors.push(result.error);
    }

    return fail({ kind: 'union', errors });
  }
}

export function union<T extends Typ<unknown, unknown, unknown>[]>(...args: T): CreateUnionFromTypes<T> {
  return new UnionType(args) as any;
}

export function unionIfNeeded<T extends Typ<unknown, unknown>[]>(types: T): UnionOrSingle<T> {
  return (types.length > 1 ? union(...types) : types.length === 1 ? types[0] : never) as any;
}

export function* flatIterateUnion(type: Typ): IterableIterator<Typ> {
  if (type.isUnion()) {
    for (const member of (type as UnionType<Typ[], unknown>).members) {
      yield* flatIterateUnion(member);
    }
  } else {
    yield type;
  }
}

export function flattenUnionMembers<T extends UnionType<unknown[], unknown>>(union: T): FlattenUnionMembers<T> {
  return [...flatIterateUnion(union)] as any;
}

export function flattenUnion<T extends UnionType<unknown[], unknown>>(
  unionToFlatten: T
): UnionType<FlattenUnionMembers<T>, TsType<T>> {
  return union(...flattenUnionMembers(unionToFlatten));
}

// // export type UnionDefinition =
// //   | {
// //       members: Typ<unknown, unknown>[];
// //     }
// //   // | Constructor;
// //   | (() => any);

// // export type ToTsTypes<T> = T extends Type<unknown, unknown>
// //   ? T[typeof _type]
// //   : {
// //       [P in keyof T]: ToTsTypes<T[P]>;
// //     };

// type UnionDefMemberTypes<T> = T extends IUnionType<infer U> ? U : never;

// // type UnionDefMemberTypes<T> = T[keyof T];

// // export type TupleTsTypes<T> = T extends IUnionType<infer TMembers>
// //   ? TMembers
// //   : T extends [infer _THead, ...infer _TRest]
// //   ? T
// //   : [T];
// export type MembersToTsTypes2<T> = T extends IUnionType<infer TMembers>
//   ? TypTupleToTsTypes<TMembers>
//   : {
//       [P in keyof T]: TypTupleToTsTypes<T[P]>;
//     };

// export type TypTupleToTsTypes2<T, Acc extends unknown[] = []> = T extends readonly [infer H, ...infer TRest]
//   ? TypTupleToTsTypes<TRest, H extends Type<unknown, unknown> ? [...Acc, TsType<H>] : Acc>
//   : Acc;

// export type MembersToTsTypes<T> = T extends Type<unknown, unknown>
//   ? T[typeof _type]
//   : {
//       [P in keyof T]: TypTupleToTsTypes<T[P]>;
//     };

// export type TypTupleToTsTypes<T, Acc extends unknown[] = []> = T extends readonly [infer H, ...infer TRest]
//   ? TypTupleToTsTypes<TRest, H extends Type<unknown, unknown> ? [...Acc, TsType<H>] : Acc>
//   : Acc;

// // export type ShapeDefinitionToUnionType<T> = T extends () => unknown ? CreateUnionFromTypes<ReturnType<T>> : never;
// // export type ShapeDefinitionToUnionType<T, TType> = T extends Constructor
// //   ? InstanceType<T> extends { members: Typ[] }
// //     ? UnionType<InstanceType<T>, MembersToTsTypes<InstanceType<T>>>
// //     : never
// //   : never;
// // export type ShapeDefinitionToUnionType<T> = T extends Constructor
// //   ? InstanceType<T> extends { members: () => any }
// //     ? UnionType<InstanceType<T>['members'], MembersToTsTypes<InstanceType<T>>>
// //     : never
// //   : never;

// export type ShapeDefinitionToUnionType<T> = T extends Constructor
//   ? // ? InstanceType<T> extends { members: () => any }
//     // UnionType<InstanceType<T>, MembersToTsTypes<InstanceType<T>>>
//     UnionType<InstanceType<T>, MembersToTsTypes<InstanceType<T>>>
//   : never;
// // : never;

// // export function unionRef<T extends { members: () => any }>(unionDef: T): ShapeDefinitionToUnionType<T> {
// export function unionRef<T extends Constructor>(unionDef: T): ShapeDefinitionToUnionType<T> {
//   // export function unionRef<T extends { members: () => any }>(
//   //   unionDef: T
//   // ): UnionType<ReturnType<T['members']>, ReturnType<T['members']>> {
//   // export function unionRef<T, TType>(unionDef: T): UnionType<T, TType> {
//   const unionDefMembers = new (unionDef as any)();

//   return new UnionType(unionDefMembers.members) as any;
// }

// export type UnionRefToUnion<T> = T extends Constructor
//   ? // ? InstanceType<T> extends { members: () => any }
//     // UnionType<InstanceType<T>, MembersToTsTypes<InstanceType<T>>>
//     UnionType<InstanceType<T>, InstanceType<T>>
//   : never;

// export function unionRefToUnion<T extends IUnionType<unknown>(unionDef: T): ShapeDefinitionToUnionType<T> {
//   // export function unionRef<T extends { members: () => any }>(
//   //   unionDef: T
//   // ): UnionType<ReturnType<T['members']>, ReturnType<T['members']>> {
//   // export function unionRef<T, TType>(unionDef: T): UnionType<T, TType> {
//   const unionDefMembers = new (unionDef as any)();

//   return new UnionType(unionDefMembers.members) as any;
// }

// // export function recursiveUnion<T, R>(definition: () => UnionType<R, T>): UnionType<ReturnType<typeof definition>['members'], T> {
// //   const results = definition() as any;
// //   return results;
// // }

// export class UnionRefType<TMembers extends { members: Typ[] }, T>
//   extends Typ<'union', TMembers, T>
//   implements IUnionType<TMembers>
// {
//   //Note that members and shape are really the same object
//   constructor(public members: TMembers, name?: string) {
//     super('union', members, name);
//     // this.unionTypes = shape as any;
//   }

//   isUnion(): boolean {
//     return true;
//   }

//   //TODO: test
//   unwrap(): ExcludeType<TMembers, [Typ<'undefined', unknown, unknown>, Typ<'null', unknown, unknown>]> {
//     return excludeKinds(this, undef, nul) as any;
//   }

//   parse(value: unknown): ParseResult<T> {
//     // for (const member of this.shape as Array<unknown>) {
//     //   const result = (member as any).safeParse(value);
//     //   if (result.success) {
//     //     return result;
//     //   }
//     //   // failedResults.push(result);
//     // }
//     return fail();
//   }
// }
// // export function unionRef<T, TType>(unionDef: T): ShapeDefinitionToUnionType<T, TType> {
// // // export function unionRef<T, TType>(unionDef: T): UnionType<T, TType> {
// //   const unionDefMembers = new (unionDef as any)();

// //   return new UnionType(unionDefMembers.members) as any;
// // }
