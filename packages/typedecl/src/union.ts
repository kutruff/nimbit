import { areEqual } from './areEqual';
import { CollapseSingleMemberUnionType, ElementType, FlattenedUnion, Types, UnionType } from './index';

export const flattenUnionMembers = <T extends Types[]>(members: T): Array<FlattenedUnion<T>> => {
  const flattened: Array<Types> = [];
  const visited = new Set<Types>();

  function visit(currentType: Types) {
    if (visited.has(currentType)) {
      return;
    }
    visited.add(currentType);
    if (currentType.kind === 'union') {
      currentType.memberTypes.forEach(x => visit(x as Types));
    } else {
      flattened.push(currentType);
    }
  }

  for (const element of members) {
    if (element.kind === 'union') {
      visit(element as UnionType<Types>);
    } else {
      flattened.push(element);
    }
  }

  return flattened as Array<FlattenedUnion<T>>;
};

export const compressUnionMembers = <T extends Types[]>(unionMembers: T) => {
  const result = [...unionMembers];

  const comparisonCache = new Map<Types, Map<Types, boolean>>();

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

export type UnionOrSingleType<T> = CollapseSingleMemberUnionType<FlattenedUnion<T>>;

export const union = <T extends Types[]>(...args: T): UnionOrSingleType<ElementType<T>> => {
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
