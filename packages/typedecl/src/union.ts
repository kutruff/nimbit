/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fail, Typ, type _type, type ElementType, type ParseResult, type TsType, type Type } from '.';

//Required for type inference of the return type for the union() function
export interface IUnionType<TMembers extends Type<unknown, unknown>> extends Type<'union', unknown> {
  memberTypes: TMembers[];
}

export type FlattenedUnion<T> = T extends IUnionType<infer K> ? FlattenedUnion<K> : T;

export class UnionType<TMembers extends Type<unknown, unknown>, T, TInput = T>
  extends Typ<'union', T, TInput>
  implements IUnionType<TMembers>
{
  constructor(public memberTypes: TMembers[], public name?: string) {
    super('union', name);
  }

  parse(value: TInput, opts = Typ.defaultOpts): ParseResult<T> {
    for (const member of this.memberTypes) {
      const result = (member as any).parse(value, opts);
      if (result.success) {
        return result;
      }
      // failedResults.push(result);
    }
    return fail();
  }
}

function flattenUnionMembers<T extends Type<unknown, unknown>[]>(members: T) {
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
}

export function union<T extends Type<unknown, unknown>[]>(
  ...args: T
): UnionType<FlattenedUnion<ElementType<T>>, TsType<ElementType<T>>, TsType<ElementType<T>>> {
  const flattenedMembers = flattenUnionMembers(args);
  return new UnionType(flattenedMembers) as any;
}
