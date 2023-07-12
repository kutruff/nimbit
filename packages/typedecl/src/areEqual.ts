import {
  type ArrayType,
  type EnumType,
  type LiteralType,
  type ObjType,
  type Shape,
  type TupleType,
  type Type,
  type UnionType
} from '.';

export const areEqual = (a: Type, b: Type, comparisonCache?: Map<Type, Map<Type, boolean>>): boolean => {
  if (a === b) return true;

  if (a.kind !== b.kind) return false;

  comparisonCache ??= new Map();

  //For recursive types, not having both sides cached will result in areEqual(a, b) and areEqual(b, a) not
  // matching, but that is the most it could miss.
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

  //For recursive types, we need to set the result to true before we recurse to avoid infinite recursion
  alreadyComparedTo.set(b, true);

  switch (a.kind) {
    case 'literal': {
      const aTyped = a as LiteralType<unknown>;
      const bTyped = b as typeof aTyped;
      result = aTyped.literal === bTyped.literal;
      break;
    }
    case 'array': {
      const aTyped = a as ArrayType<Type<unknown, unknown>, unknown>;
      const bTyped = b as typeof aTyped;
      result = areEqual(aTyped.elementType, bTyped.elementType, comparisonCache);
      break;
    }
    case 'union': {
      const aTyped = a as UnionType<Type<unknown, unknown>, unknown>;
      const bTyped = b as typeof aTyped;

      if (aTyped.memberTypes.length !== bTyped.memberTypes.length) {
        result = false;
        break;
      }

      let didFindMatchingMember = false;
      for (const memberA of aTyped.memberTypes) {
        didFindMatchingMember = false;
        for (const memberB of bTyped.memberTypes) {
          if (areEqual(memberA, memberB, comparisonCache)) {
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
    case 'enum': {
      const aTyped = a as EnumType<unknown[], unknown>;
      const bTyped = b as typeof aTyped;
      const aValues = aTyped.values;
      const bValues = bTyped.values;

      if (a.name !== b.name || aValues.length !== bValues.length) {
        result = false;
      } else {
        //TODO: is O(n^2) the best we can do here since the set of values *should* be small?
        result = false;
        for (const aValue of aValues) {
          result = false;
          for (const bValue of bValues) {
            if (aValue === bValue) {
              result = true;
              break;
            }
          }
          if (!result) {
            break;
          }
        }
      }
      break;
    }
    case 'tuple': {
      const aTyped = a as TupleType<[Type<unknown, unknown>, ...Type<unknown, unknown>[]]>;
      const bTyped = b as typeof aTyped;
      const aElements = aTyped.elementTypes;
      const bElements = bTyped.elementTypes;

      if (aElements.length !== bElements.length) {
        result = false;
      } else {
        result = true;
        for (let i = 0; i < aElements.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (!areEqual(aElements[i]!, bElements[i]!, comparisonCache)) {
            result = false;
            break;
          }
        }
      }
      break;
    }
    case 'object': {
      const aTyped = a as ObjType<Shape, unknown>;
      const bTyped = b as typeof aTyped;

      const aShape = aTyped.shape;
      const bShape = bTyped.shape;

      const aKeys = Object.keys(aShape);
      const bKeys = Object.keys(bShape);

      if (aKeys.length === bKeys.length) {
        result = true;

        for (const aKey of aKeys) {
          const aProp = aShape[aKey];
          const bProp = bShape[aKey];
          const arePropsEqual = aProp != null && bProp != null && areEqual(aProp, bProp, comparisonCache);

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
