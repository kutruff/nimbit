/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Typ,
  type _type,
  type ElementType,
  type FlattenedUnion,
  type IUnionType,
  type ParseResult,
  type TsType,
  type Type
} from '.';

export class UnionType<TMembers extends Type<unknown, unknown>, T>
  extends Typ<'union', T>
  implements IUnionType<TMembers>
{
  constructor(public memberTypes: TMembers[], public name?: string) {
    super('union', name);
  }

  parse(value: unknown): ParseResult<T> {
    for (const member of this.memberTypes) {
      const result = (member as any).parse(value);
      if (result.success) {
        return result;
      }
      // failedResults.push(result);
    }
    return { success: false };
  }
}

export function parseUnion<TMembers extends Type<unknown, unknown>, T>(
  unionType: UnionType<TMembers, T>,
  value: unknown
): ParseResult<T> {
  // const failedResults = [];
  for (const member of unionType.memberTypes) {
    const result = (member as any).parse(value);
    if (result.success) {
      return result;
    }
    // failedResults.push(result);
  }
  return { success: false };
}

const flattenUnionMembers = <T extends Type<unknown, unknown>[]>(members: T) => {
  const flattened: Array<Type<unknown, unknown>> = [];
  const visited = new Set<Type>();

  function visit(currentType: Type<unknown, unknown>) {
    if (visited.has(currentType)) {
      return;
    }
    visited.add(currentType);

    if (currentType.kind === 'union') {
      const union = currentType as UnionType<Type<unknown, unknown>, unknown>;
      union.memberTypes.forEach(visit);
    } else {
      flattened.push(currentType);
    }
  }
  members.forEach(visit);

  return flattened;
};

export function union<T extends Type<unknown, unknown>[]>(
  ...args: T
): UnionType<FlattenedUnion<ElementType<T>>, TsType<ElementType<T>>> {
  const flattenedMembers = flattenUnionMembers(args);
  return new UnionType(flattenedMembers) as UnionType<FlattenedUnion<ElementType<T>>, TsType<ElementType<T>>>;
}
