import { areEqual } from './areEqual';
import {
  type CollapseSingleMemberUnionType,
  type ElementType,
  type FlattenedUnion,
  type Type,
  type UnionType
} from './index';

export const flattenUnionMembers = <T extends Type<unknown, unknown> | UnionType<Type<unknown, unknown>>>(
  members: Array<T>
): Array<FlattenedUnion<T>> => {
  const flattened: Array<Type<unknown, unknown>> = [];
  const visited = new Set<Type>();

  function visit(currentType: Type<unknown, unknown>) {
    if (visited.has(currentType)) {
      return;
    }
    visited.add(currentType);
    if (currentType.kind === 'union') {
      const union = currentType as UnionType<Type<unknown, unknown>>;
      union.memberTypes.forEach(x => visit(x));
    } else {
      flattened.push(currentType);
    }
  }

  for (const element of members) {
    if (element.kind === 'union') {
      visit(element as UnionType<Type<unknown, unknown>>);
    } else {
      flattened.push(element);
    }
  }

  return flattened as Array<FlattenedUnion<T>>;
};

export const compressUnionMembers = <T extends Type<unknown, unknown>[]>(unionMembers: T) => {
  const result = [...unionMembers];

  const comparisonCache = new Map<Type, Map<Type<unknown, unknown>, boolean>>();

  for (let iForward = 0; iForward < result.length; iForward++) {
    const elementForward = result[iForward];
    if (elementForward != null) {
      for (let iBackward = result.length - 1; iBackward > iForward; iBackward--) {
        const elementBackward = result[iBackward];
        if (elementBackward != null && areEqual(elementForward, elementBackward, comparisonCache)) {
          result.splice(iBackward, 1);
        }
      }
    }
  }
  return result;
};

export type UnionOrSingleType<T extends Type<unknown, unknown>> = CollapseSingleMemberUnionType<FlattenedUnion<T>>;

export const union = <T extends Type<unknown, unknown>[]>(...args: T): UnionOrSingleType<ElementType<T>> => {
  const flattenedMembers = flattenUnionMembers(args);
  const compressed = compressUnionMembers(flattenedMembers);

  if (compressed.length === 0) throw new Error();

  if (compressed.length === 1) {
    return compressed[0] as UnionOrSingleType<ElementType<T>>;
  } else {
    return {
      kind: 'union',
      memberTypes: compressed
    } as UnionOrSingleType<ElementType<T>>;
  }
};
