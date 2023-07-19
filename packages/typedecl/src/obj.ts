/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  areEqual,
  fail,
  getKeys,
  keyMap,
  pass,
  Typ,
  TypOrig,
  type _type,
  type ComparisonCache,
  type Constructor,
  type MakeUndefinedOptional,
  type ObjectKeyMap,
  type ParseOptions,
  type ParseResult,
  type Resolve,
  type Shape,
  type ShapeDefinition,
  type ShapeDefinitionToObjType,
  type ToTsTypes,
  type Type
} from '.';

export class ObjTypeOrig<TShape, T> extends TypOrig<'object', T> {
  constructor(public shape: TShape, public k: ObjectKeyMap<TShape>, name?: string, public strict?: boolean) {
    super('object', name);
  }

  parse(value: T, opts: ParseOptions = Typ.defaultOpts): ParseResult<T> {
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      return fail();
    }
    const isStrict = this.strict === undefined ? opts.strict : this.strict;
    const result: any = isStrict ? {} : { ...value };

    const shape = this.shape as any;
    for (const key of getKeys(shape)) {
      if (key === 'prop2') {
        console.log(shape[key]);
      }
      const propResult = shape[key].parse((value as any)[key], opts);

      if (!propResult.success) {
        return fail();
      }
      result[key] = propResult.value;
    }
    return pass(result);
  }

  areEqual(other: Type<unknown, unknown>, cache: ComparisonCache): boolean {
    const otherT = other as typeof this;

    const shape = this.shape as Shape;
    const otherShape = otherT.shape as Shape;

    const keys = Object.keys(shape);
    const otherKeys = Object.keys(otherShape);

    if (keys.length !== otherKeys.length) {
      return false;
    }

    for (const key of keys) {
      const prop = shape[key];
      const otherProp = otherShape[key];
      //TODO: cleanup all the casting
      const arePropsEqual = prop != null && otherProp != null && areEqual(prop as Typ, otherProp as Typ, cache);

      if (!arePropsEqual) {
        return false;
      }
    }

    return true;
  }
}

const constructorsToObj = new WeakMap();

//Note: Having the option to set a name is important here for recursive objects.
export function objOrig<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition,
  name?: string,
  strict?: boolean
): ShapeDefinitionToObjType<TShapeDefinition> {
  const resultObj = new ObjTypeOrig({}, {}, name, strict) as any;

  if (typeof shapeDefinition === 'function') {
    const constructor = shapeDefinition;
    const existingObj = constructorsToObj.get(constructor) as ShapeDefinitionToObjType<TShapeDefinition> | undefined;
    if (existingObj) {
      return existingObj;
    }
    constructorsToObj.set(constructor, resultObj);
    shapeDefinition = new (constructor as Constructor)() as any;
  }
  resultObj.shape = { ...shapeDefinition };
  resultObj.k = keyMap(resultObj.shape);
  return resultObj as ShapeDefinitionToObjType<TShapeDefinition>;
}

export class ObjType<TShape, T> extends Typ<'object', TShape, T> {
  constructor(shape: TShape, name?: string, public strict?: boolean) {
    super('object', shape, name);
  }

  parse(value: T, opts: ParseOptions = Typ.defaultOpts): ParseResult<T> {
    //TODO: turn this into a global that users can add to to add their own custom types.

    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      return fail();
    }
    const isStrict = this.strict === undefined ? opts.strict : this.strict;
    const result: any = isStrict ? {} : { ...value };

    const shape = this.shape as any;
    for (const key of getKeys(shape)) {
      const propResult = shape[key].parse((value as any)[key], opts);

      if (!propResult.success) {
        return fail();
      }
      result[key] = propResult.value;
    }
    return pass(result);
  }

  areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
    const otherT = other as typeof this;

    const shape = this.shape as Shape;
    const otherShape = otherT.shape as Shape;

    const keys = Object.keys(shape);
    const otherKeys = Object.keys(otherShape);

    if (keys.length !== otherKeys.length) {
      return false;
    }

    for (const key of keys) {
      const prop = shape[key];
      const otherProp = otherShape[key];
      const arePropsEqual = prop != null && otherProp != null && areEqual(prop as any, otherProp as any, cache);

      if (!arePropsEqual) {
        return false;
      }
    }

    return true;
  }
}

// export type ShapeDefinitionToObjType2<T> = T extends Constructor
//   ? Typ<'object', Required<InstanceType<T>>, ToTsTypes<InstanceType<T>>>
//   : Typ<'object', T, Resolve<MakeUndefinedOptional<ToTsTypes<T>>>>;

export type ShapeDefinitionToObjType2<T> = T extends Constructor
  ? ObjType<Required<InstanceType<T>>, ToTsTypes<InstanceType<T>>>
  : ObjType<T, Resolve<MakeUndefinedOptional<ToTsTypes<T>>>>;

//TODO: check if this may want to return Typ2 not ObjType2?
//Note: Having the option to set a name is important here for recursive objects.
export function obj<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition,
  name?: string,
  strict?: boolean
): ShapeDefinitionToObjType2<TShapeDefinition> {
  const resultObj = new ObjType({}, name, strict) as any;

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
