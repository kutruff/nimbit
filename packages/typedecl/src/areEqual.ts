import { type IObjectDefinition, type ObjType, type Types } from './types';

export const areEqual = (a: Types, b: Types, comparisonCache?: Map<Types, Map<Types, boolean>>): boolean => {
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
      const bTyped = b as typeof a;
      result = a.literal === bTyped.literal;
      break;
    }
    case 'array': {
      const bTyped = b as typeof a;
      result = areEqual(a.elementType, bTyped.elementType, comparisonCache);
      break;
    }
    case 'union': {
      const bTyped = b as typeof a;
      if (a.memberTypes.length !== bTyped.memberTypes.length) {
        result = false;
        break;
      }

      let didFindMatchingMember = false;
      const remaining = new Set(bTyped.memberTypes);

      for (const memberA of a.memberTypes) {
        didFindMatchingMember = false;
        for (const memberB of bTyped.memberTypes) {
          if (areEqual(memberA as Types, memberB as Types, comparisonCache)) {
            remaining.delete(memberB);
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
      const bTyped = b as ObjType<IObjectDefinition>;
      const aDefinition = a.objectDefinition;
      const bDefinition = bTyped.objectDefinition;

      if (bDefinition === undefined) {
        console.log('b :>> ', b);
        console.log('aShape :>> ', aDefinition);
      }
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
