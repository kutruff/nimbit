import { type Typ, type Type } from '.';

export type ComparisonCache = WeakMap<Type, WeakMap<Type, boolean>>;

export const areEqual = (a: Type, b: Type, cache?: ComparisonCache): boolean => {
  if (a === b) return true;

  if (a.kind !== b.kind) return false;

  cache ??= new WeakMap();

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
  const result = (a as Typ<unknown, unknown>).areEqual(b, cache);
  alreadyComparedTo.set(b, result);
  return result;
};
