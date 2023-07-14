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
  type _type,
  type ComparisonCache,
  type Constructor,
  type ObjectKeyMap,
  type ParseOptions,
  type ParseResult,
  type Shape,
  type ShapeDefinition,
  type ShapeDefinitionToObjType,
  type Type
} from '.';

export class ObjType<TShape, T> extends Typ<'object', T> {
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
      const arePropsEqual = prop != null && otherProp != null && areEqual(prop, otherProp, cache);

      if (!arePropsEqual) {
        return false;
      }
    }

    return true;
  }
}

const constructorsToObj = new WeakMap();

//Note: Having the option to set a name is important here for recursive objects.
export function obj<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition,
  name?: string,
  strict?: boolean
): ShapeDefinitionToObjType<TShapeDefinition> {
  const resultObj = new ObjType({}, {}, name, strict) as any;

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
