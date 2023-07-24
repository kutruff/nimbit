/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  type ShapeDefinitionToObjType
} from '.';

export class ObjType<TShape, T> extends Typ<'object', TShape, T> {
  _k?: ObjectKeyMap<TShape>;
  get k(): ObjectKeyMap<TShape> {
    if (!this._k) this._k = keyMap(this.shape as any);
    return this._k;
  }

  constructor(shape: TShape, name?: string, public strict?: boolean) {
    super('object', shape, name);
  }

  parse(value: unknown, opts: ParseOptions = Typ.defaultOpts): ParseResult<T> {
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

      if (!prop == null || otherProp == null || !areEqual(prop as any, otherProp as any, cache)) {
        return false;
      }
    }

    return true;
  }
}

const constructorsToObj = new WeakMap();

//TODO: check if this may want to return Typ or ObjType?
//Note: Having the option to set a name is important here for recursive objects.
export function obj<TShapeDefinition extends ShapeDefinition>(
  shapeDefinition: TShapeDefinition,
  name?: string,
  strict?: boolean
): ShapeDefinitionToObjType<TShapeDefinition> {
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