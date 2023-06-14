import { ArrayType, LiteralType, UnionType, type ObjType, type ObjectDefinition, type Type } from './types';

export const areEqual = (a: Type, b: Type, comparisonCache?: Map<Type, Map<Type, boolean>>): boolean => {
  if (a === b) return true;

  if (a.kind !== b.kind) return false;

  comparisonCache ??= new Map();

  let alreadyComparedTo = comparisonCache.get(a);

  if (alreadyComparedTo === undefined) {
    alreadyComparedTo = new Map();
    comparisonCache.set(a, alreadyComparedTo);
  }

  const previousComparison = alreadyComparedTo.get(b);
  if (previousComparison !== undefined) {
    return previousComparison;
  }

  let result: boolean | undefined = undefined;

  alreadyComparedTo.set(b, true);

  switch (a.kind) {
    case 'literal': {
      const aTyped = a as LiteralType<unknown>;
      const bTyped = b as typeof aTyped;
      result = aTyped.literal === bTyped.literal;
      break;
    }
    case 'array': {
      const aTyped = a as ArrayType<Type>;
      const bTyped = b as typeof aTyped;
      result = areEqual(aTyped.elementType, bTyped.elementType, comparisonCache);
      break;
    }
    case 'union': {
      const aTyped = a as UnionType<Type>;
      const bTyped = b as typeof aTyped;

      if (aTyped.memberTypes.length !== bTyped.memberTypes.length) {
        result = false;
        break;
      }

      let didFindMatchingMember = false;
      for (const memberA of aTyped.memberTypes) {
        didFindMatchingMember = false;
        for (const memberB of bTyped.memberTypes) {
          if (areEqual(memberA as Type, memberB as Type, comparisonCache)) {
            didFindMatchingMember = true;
            break;
          }
        }
        if (!didFindMatchingMember) {
          break;
        }
      }
      result = didFindMatchingMember;
      break;
    }
    case 'object': {
      const aTyped = a as ObjType<ObjectDefinition>;
      const bTyped = b as typeof aTyped;

      const aDefinition = aTyped.objectDefinition;
      const bDefinition = bTyped.objectDefinition;

      const aKeys = Object.keys(aDefinition);
      const bKeys = Object.keys(bDefinition);

      if (aKeys.length === bKeys.length) {
        result = true;

        for (const aKey of aKeys) {
          const aProp = aDefinition[aKey];
          const bProp = bDefinition[aKey];
          const arePropsEqual =
            aProp != null &&
            bProp != null &&
            areEqual(aProp.type, bProp.type, comparisonCache) &&
            aProp.attributes.isOptional === bProp.attributes.isOptional &&
            aProp.attributes.isReadonly === bProp.attributes.isReadonly;

          if (!arePropsEqual) {
            result = false;
            break;
          }
        }
      } else {
        result = false;
      }

      break;
    }
    default:
      result = true;
      break;
  }
  alreadyComparedTo.set(b, result);
  return result;
};
