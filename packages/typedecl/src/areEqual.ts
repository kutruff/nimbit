import { flattenUnionGen, type Typ, type Type } from '.';

export type ComparisonCache = WeakMap<Type, WeakMap<Type, boolean>>;

//TODO: change name to extends since order matters, or should there be areEqual and extends?
export const areEqual = (a: Typ, b: Typ, cache?: ComparisonCache): boolean => {
  if (a === b) return true;

  cache ??= new WeakMap();

  if (!a.isUnion() && !b.isUnion() && a.kind !== b.kind) {
    return false;
  }

  //For recursive types, not having both sides cached will result in areEqual(a, b) and areEqual(b, a) not
  // matching, but that is the most it could miss.
  let alreadyComparedTo = cache.get(a);

  if (alreadyComparedTo === undefined) {
    alreadyComparedTo = new WeakMap();
    cache.set(a, alreadyComparedTo);
  }

  const previousComparison = alreadyComparedTo.get(b);
  if (previousComparison !== undefined) {
    return previousComparison;
  }

  //For recursive types, we need to set the result to true before we recurse to avoid infinite recursion
  alreadyComparedTo.set(b, true);

  let result = true;
  if (a.isUnion() && b.isUnion()) {
    for (const memberA of flattenUnionGen(a)) {
      let foundMatchingMember = false;
      for (const memberB of flattenUnionGen(b)) {
        if (areEqual(memberA, memberB, cache)) {
          foundMatchingMember = true;
          break;
        }
      }
      if (!foundMatchingMember) {
        result = false;
        break;
      }
    }
  } else if (a.isUnion()) {
    for (const member of flattenUnionGen(a)) {
      if (!areEqual(member, b, cache)) {
        result = false;
        break;
      }
    }
  } else if (b.isUnion()) {
    for (const member of flattenUnionGen(b)) {
      if (!areEqual(a, member, cache)) {
        result = false;
        break;
      }
    }
  } else {
    result = a.areEqual(b, cache);
  }

  alreadyComparedTo.set(b, result);
  return result;
};
