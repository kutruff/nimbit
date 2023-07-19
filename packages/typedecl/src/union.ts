/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fail, never, Typ, type _type, type ElementType, type ParseResult, type TsType } from '.';

export class UnionType<TKind, TShape, T> extends Typ<TKind, TShape, T> {
  constructor(shape: TShape[], name?: string) {
    super(shape.map(x => (x as any).kind) as TKind, shape as TShape, name);
    this.unionTypes = shape as any;
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

export function union<T extends Typ<unknown, unknown>[]>(
  ...args: T
): Typ<ElementType<T>['kind'], ElementType<T>['shape'], TsType<ElementType<T>>> {
  // const flattenedMembers = flattenUnionMembers(args);
  // return new UnionType2([...new Set(flattenedMembers.map(x => x.kind))]) as any;
  return new UnionType(args) as any;
}

export function* flattenUnionGen(type: Typ): IterableIterator<Typ> {
  if (type.isUnion()) {
    for (const member of type.unionTypes) {
      yield* flattenUnionGen(member);
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
