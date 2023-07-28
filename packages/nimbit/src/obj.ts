/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  cloneObject,
  EVIL_PROTO,
  fail,
  failWrongType,
  isBasicObject,
  keyMap,
  pass,
  Typ,
  type _type,
  type Constructor,
  type MakeUndefinedOptional,
  type ObjectKeyMap,
  type ParseError,
  type ParseResult,
  type Resolve,
  type Type
} from '.';

export interface ObjTypShape {
  [key: string | symbol]: Type<unknown, unknown>;
}

export type ObjShapeDefinition = ObjTypShape | Constructor;

export type ObjShapeToTsTypes<T> = T extends Type<unknown, unknown>
  ? T[typeof _type]
  : {
      [P in keyof T]: ObjShapeToTsTypes<T[P]>;
    };

export type ShapeDefinitionToObjType<T> = T extends Constructor
  ? ObjType<Required<InstanceType<T>>, ObjShapeToTsTypes<InstanceType<T>>>
  : ObjType<T, Resolve<MakeUndefinedOptional<ObjShapeToTsTypes<T>>>>;

export const PropertyPolicy = {
  strip: 0,
  strict: 1,
  passthrough: 2
} as const;

export type PropPolicy = (typeof PropertyPolicy)[keyof typeof PropertyPolicy];

type PropertyErrorMap = Map<PropertyKey, ParseError>;

export interface ObjectError {
  kind: 'object';
  errors: PropertyErrorMap;
}

export interface StrictnessError {
  kind: 'strictness';
}

//TODO see if external imports get picked up
declare module '.' {
  // Where you define MessageTypes
  export interface ParseErrorTypes {
    Object: ObjectError;
    Strictness: StrictnessError;
  }
}

function addPropertyError(map: PropertyErrorMap | undefined, key: PropertyKey, error: ParseError): PropertyErrorMap {
  map = map ?? new Map();
  map.set(key, error);
  return map;
}

export class ObjType<TShape, T> extends Typ<'object', TShape, T> {
  private _k?: ObjectKeyMap<TShape>;
  get k(): ObjectKeyMap<TShape> {
    if (!this._k) this._k = keyMap(this.shape as any);
    return this._k;
  }
  catchallType?: Typ<unknown, unknown, unknown>;

  constructor(shape: TShape, name?: string, public propertyPolicy?: PropPolicy) {
    super('object', shape, name);
  }

  strict(): typeof this {
    return this.changePropertyPolicy(PropertyPolicy.strict);
  }

  strip(): typeof this {
    return this.changePropertyPolicy(PropertyPolicy.strip);
  }

  passthrough(): typeof this {
    return this.changePropertyPolicy(PropertyPolicy.passthrough);
  }

  catchall(catchallType: Typ<unknown, unknown, unknown> | undefined): typeof this {
    const clone = cloneObject(this);
    clone.catchallType = catchallType;
    return clone;
  }

  changePropertyPolicy(policy: PropPolicy): typeof this {
    const clone = cloneObject(this);
    clone.propertyPolicy = policy;
    return clone;
  }

  safeParse(value: unknown): ParseResult<T> {
    //TODO: turn this into a global that users can add to to add their own custom types.
    //TODO: do we need to check for array here?
    if (!isBasicObject(value)) {
      return failWrongType(this.kind, value);
    }

    const shape = this.shape as any;

    let result: any = {};
    let errorMap: PropertyErrorMap | undefined = undefined;

    if (this.catchallType) {
      const valueKeys = Reflect.ownKeys(value);
      for (const key of valueKeys) {
        if (!Object.hasOwn(shape, key)) {
          // const propResult = ctx.push(key, () => this.catchallType!.safeParse((value as any)[key]));
          const propResult = this.catchallType.safeParse((value as any)[key]);

          if (propResult.success) {
            result[key] = propResult.data;
          } else {
            errorMap = addPropertyError(errorMap, key, propResult.error);
          }
        }
      }
    } else if (this.propertyPolicy === PropertyPolicy.strict) {
      const valueKeys = Reflect.ownKeys(value);
      for (const key of valueKeys) {
        if (!Object.hasOwn(shape, key)) {
          errorMap = addPropertyError(errorMap, key, { kind: 'strictness' });
        }
      }
    } else if (this.propertyPolicy == PropertyPolicy.passthrough) {
      if (Object.hasOwn(value, EVIL_PROTO)) {
        errorMap = addPropertyError(errorMap, EVIL_PROTO, { kind: 'strictness' });
      } else {
        result = { ...value };
      }
    }

    for (const key of Reflect.ownKeys(shape)) {
      const propResult = shape[key].safeParse((value as any)[key]);
      if (propResult.success) {
        result[key] = propResult.data;
      } else {
        errorMap = addPropertyError(errorMap, key, propResult.error);
      }
    }
    return errorMap === undefined ? pass(result) : fail({ kind: 'object', errors: errorMap });
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   const otherT = other as typeof this;

  //   const shape = this.shape as Shape;
  //   const otherShape = otherT.shape as Shape;

  //   const keys = Object.keys(shape);
  //   const otherKeys = Object.keys(otherShape);

  //   if (keys.length !== otherKeys.length) {
  //     return false;
  //   }

  //   for (const key of keys) {
  //     const prop = shape[key];
  //     const otherProp = otherShape[key];

  //     if (!prop == null || otherProp == null || !areEqual(prop as any, otherProp as any, cache)) {
  //       return false;
  //     }
  //   }

  //   return true;
  // }
}

const constructorsToObj = new WeakMap();

//TODO: check if this may want to return Typ or ObjType?
//Note: Having the option to set a name is important here for recursive objects.
export function obj<TShapeDefinition extends ObjShapeDefinition>(
  shapeDefinition: TShapeDefinition,
  name?: string,
  policy: PropPolicy = PropertyPolicy.strip
): ShapeDefinitionToObjType<TShapeDefinition> {
  const resultObj = new ObjType({}, name, policy) as any;

  if (typeof shapeDefinition === 'function') {
    const constructor = shapeDefinition;
    const existingObj = constructorsToObj.get(constructor);
    if (existingObj) {
      return existingObj;
    }
    constructorsToObj.set(constructor, resultObj);
    shapeDefinition = new (constructor as Constructor)() as any;
  }
  resultObj.shape = { ...shapeDefinition };
  return resultObj;
}
