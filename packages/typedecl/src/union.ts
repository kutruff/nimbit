import { areEqual } from './areEqual';
import { any, type ElementType, type FlattenedUnion, type Type, type UnionOrSingleType, type UnionType } from './index';

const flattenUnionMembers = <T extends Type<unknown, unknown> | UnionType<Type<unknown, unknown>>>(
  members: Array<T>
):
  | [hasTheAnyTypeBeenFound: false, flattened: Array<FlattenedUnion<T>>]
  | [hasTheAnyTypeBeenFound: true, flattened: undefined] => {
  const flattened: Array<Type<unknown, unknown>> = [];
  const visited = new Set<Type>();

  let hasTheAnyTypeBeenFound = false;
  function visit(currentType: Type<unknown, unknown>) {
    hasTheAnyTypeBeenFound ||= currentType.kind === 'any';
    if (visited.has(currentType) || hasTheAnyTypeBeenFound) {
      return;
    }
    visited.add(currentType);

    if (currentType.kind === 'union') {
      const union = currentType as UnionType<Type<unknown, unknown>>;
      union.memberTypes.forEach(visit);
    } else {
      flattened.push(currentType);
    }
  }
  members.forEach(visit);

  return hasTheAnyTypeBeenFound ? [true, undefined] : [false, flattened as Array<FlattenedUnion<T>>];
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

export const union = <T extends Type<unknown, unknown>[]>(...args: T): UnionOrSingleType<ElementType<T>> => {
  const [hasTheAnyTypeBeenFound, flattenedMembers] = flattenUnionMembers(args);
  if (hasTheAnyTypeBeenFound) {
    return any as UnionOrSingleType<ElementType<T>>;
  }

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
