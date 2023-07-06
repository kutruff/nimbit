import { UnionType, type _type, type ElementType, type FlattenedUnion, type TsType, type Type } from '.';

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

export const union = <T extends Type<unknown, unknown>[]>(
  ...args: T
): UnionType<FlattenedUnion<ElementType<T>>, TsType<ElementType<T>>> => {
  const flattenedMembers = flattenUnionMembers(args);
  return new UnionType(flattenedMembers) as UnionType<FlattenedUnion<ElementType<T>>, TsType<ElementType<T>>>;
};
