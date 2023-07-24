/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  exclude,
  fail,
  never,
  Typ,
  undef,
  type _type,
  type ElementType,
  type ExcludeType,
  type IsLengthOneTuple,
  type ParseResult,
  type TsType
} from '.';

export interface IUnionType<TMembers extends unknown[]> {
  members: TMembers;
}

export type CreateUnionFromTypes<T> = T extends Typ[]
  ? UnionType<ElementType<T>['kind'], ElementType<T>['shape'], ElementType<T>[typeof _type], T>
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

export type ToUnionMemberList<T> = T extends IUnionType<infer TM>
  ? TM
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

export class UnionType<TKind, TShape, T, TMembers extends unknown[]>
  extends Typ<TKind, TShape, T>
  implements IUnionType<TMembers>
{
  //Not athat members and shape are really the same object
  constructor(public members: TMembers, shape: TShape[], name?: string) {
    super(shape.map(x => (x as any).kind) as TKind, shape as TShape, name);
    this.unionTypes = shape as any;
  }

  //TODO: test
  unwrap(): ExcludeType<TMembers, [typeof undef]> {
    return exclude(this, undef) as any;
  }

  parse(value: unknown, opts = Typ.defaultOpts): ParseResult<T> {
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

export function union<T extends Typ<unknown, unknown, unknown>[]>(...args: T): CreateUnionFromTypes<T> {
  return new UnionType(args, args) as any;
}

export function unionIfNeeded<T extends Typ<unknown, unknown>[]>(types: T) {
  return (types.length > 1 ? union(...types) : types.length === 1 ? types[0] : never) as any;
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
