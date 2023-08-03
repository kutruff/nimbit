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
  failInvalidType,
  flatExcludeKinds,
  isBasicObject,
  pass,
  propertyMap,
  Typ,
  undef,
  union,
  type _type,
  type Constructor,
  type ExcludeFlattenedType,
  type MakeUndefinedOptional,
  type ObjectKeyMap,
  type ParseError,
  type ParseResult,
  type PropertyErrorMap,
  type Resolve,
  type Type,
  type UndefinedT,
  type UnionType
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

function addPropertyError(map: PropertyErrorMap | undefined, key: PropertyKey, error: ParseError): PropertyErrorMap {
  map = map ?? new Map();
  map.set(key, error);
  return map;
}

export type Extend<TA, TB> = Resolve<Omit<TA, keyof TB> & TB>;

type ShapeRemapper<T> = {
  [P in keyof T]: (x: Exclude<T[P], undefined>) => Typ<unknown, unknown, unknown>;
};

type ShapeRemapperResult<T> = {
  [P in keyof T]: T[P] extends (...args: any) => infer R ? R : never;
};

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Typ<unknown, unknown>
    ? UnionType<[T[P], UndefinedT], T[P][typeof _type] | undefined>
    : never;
};

type RequiredType<T> = {
  [P in keyof T]: T[P] extends Typ<unknown, unknown> ? ExcludeFlattenedType<T[P], [UndefinedT]> : never;
};

export class ObjType<TShape, T> extends Typ<'object', TShape, T> {
  private _k?: ObjectKeyMap<TShape>;
  get k(): ObjectKeyMap<TShape> {
    if (!this._k) this._k = propertyMap(this.shape as any) as ObjectKeyMap<TShape>;
    return this._k;
  }
  catchallType?: Typ<unknown, unknown, unknown>;

  constructor(
    shape: TShape,
    name?: string,
    public propertyPolicy?: PropPolicy
  ) {
    super('object', shape, name);
  }

  strict(): this {
    return this.changePropertyPolicy(PropertyPolicy.strict);
  }

  strip(): this {
    return this.changePropertyPolicy(PropertyPolicy.strip);
  }

  passthrough(): this {
    return this.changePropertyPolicy(PropertyPolicy.passthrough);
  }

  catchall(catchallType: Typ<unknown, unknown, unknown> | undefined): this {
    const clone = cloneObject(this);
    clone.catchallType = catchallType;
    return clone;
  }

  changePropertyPolicy(policy: PropPolicy): this {
    const clone = cloneObject(this);
    clone.propertyPolicy = policy;
    return clone;
  }

  safeParse(value: unknown): ParseResult<T> {
    //TODO: turn this into a global that users can add to to add their own custom types.
    //TODO: do we need to check for array here?
    if (!isBasicObject(value)) {
      return failInvalidType(this.kind, value);
    }

    const shape = this.shape as any;

    let result: any = {};
    let errorMap: PropertyErrorMap | undefined = undefined;

    if (this.catchallType) {
      const valueKeys = Reflect.ownKeys(value);
      for (const key of valueKeys) {
        if (!Object.hasOwn(shape, key)) {
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

  mapProps<TRemapper extends Partial<ShapeRemapper<TShape>> = Partial<ShapeRemapper<TShape>>>(
    remapShape: TRemapper
  ): ShapeDefinitionToObjType<Extend<TShape, ShapeRemapperResult<TRemapper>>> {
    return obj(this.mapShape(remapShape) as any) as any;
  }

  mapShape<TRemapper extends Partial<ShapeRemapper<TShape>> = Partial<ShapeRemapper<TShape>>>(
    remapShape: TRemapper
  ): Extend<TShape, ShapeRemapperResult<TRemapper>> {
    const resultShape = { ...this.shape } as any;
    for (const key of Reflect.ownKeys(remapShape)) {
      resultShape[key] = (remapShape as any)[key]((this.shape as any)[key]);
    }

    return resultShape;
  }

  mapPropsPicked<TRemapper extends Partial<ShapeRemapper<TShape>> = Partial<ShapeRemapper<TShape>>>(
    remapShape: TRemapper
  ): ShapeDefinitionToObjType<ShapeRemapperResult<TRemapper>> {
    return obj(this.mapShapePicked(remapShape) as any) as any;
  }

  mapShapePicked<TRemapper extends Partial<ShapeRemapper<TShape>> = Partial<ShapeRemapper<TShape>>>(
    remapShape: TRemapper
  ): ShapeRemapperResult<TRemapper> {
    const resultShape = this.pickProps(Reflect.ownKeys(remapShape) as any) as any;

    for (const key of Reflect.ownKeys(remapShape)) {
      resultShape[key] = (remapShape as any)[key]((this.shape as any)[key]);
    }

    return obj(resultShape) as any;
  }

  //TODO: figure out why this resolve is required for assignment checks in the unit test
  merge<TObjB extends ObjType<unknown, unknown>>(
    objB: TObjB
  ): ObjType<Extend<TShape, TObjB['shape']>, Extend<T, TObjB[typeof _type]>> {
    return obj({ ...this.shape, ...(objB as any).shape }, undefined, objB.propertyPolicy) as any;
  }

  //TODO: figure out why this resolve is required for assignment checks in the unit test
  extend<
    TShapeDefinition extends ObjShapeDefinition,
    TObjB extends ObjType<unknown, unknown> = ShapeDefinitionToObjType<TShapeDefinition>
  >(shape: TShapeDefinition): ObjType<Extend<TShape, TObjB['shape']>, Extend<T, TObjB[typeof _type]>> {
    return obj({ ...this.shape, ...shape }) as any;
  }

  pick<K extends keyof TShape & keyof T>(...keys: Array<K>): ObjType<Pick<TShape, K>, Pick<T, K>> {
    const result = this.pickProps(keys);

    return obj(result as any) as unknown as ObjType<Pick<TShape, K>, Pick<T, K>>;
  }

  pickProps<K extends keyof TShape & keyof T>(keys: K[]): Pick<TShape, K> {
    const result = {} as Pick<TShape, K>;

    for (const key of keys) {
      result[key] = this.shape[key];
    }
    return result;
  }

  omit<K extends keyof TShape & keyof T>(...keys: Array<K>): ObjType<Omit<TShape, K>, Omit<T, K>> {
    const result = { ...this.shape };

    for (const key of keys) {
      delete result[key];
    }

    //TODO: should strictness be preserved?
    return obj(result as any) as any;
  }

  //TODO: add object pick syntax for {a: 1, b: 1}
  partial(): ObjType<PartialType<TShape>, Partial<T>>;
  partial<K extends keyof TShape & keyof T>(
    ...keys: Array<K>
  ): ObjType<Extend<TShape, PartialType<Pick<TShape, K>>>, Extend<T, Partial<Pick<T, K>>>>;
  partial<TShape, K extends keyof TShape & keyof T, T>(...keys: Array<K>): ObjType<PartialType<TShape>, Partial<T>> {
    const result = {} as ObjTypShape;
    const source = (keys.length === 0 ? this.shape : this.pickProps(keys as any)) as ObjTypShape;

    for (const key of Reflect.ownKeys(source)) {
      result[key] = union(source[key] as any, undef);
    }

    return obj({ ...this.shape, ...result }) as any;
  }

  required(): ObjType<RequiredType<TShape>, Required<T>>;
  required<K extends keyof TShape & keyof T>(
    ...keys: Array<K>
  ): ObjType<Extend<TShape, RequiredType<Pick<TShape, K>>>, Extend<T, Required<Pick<T, K>>>>;
  required<K extends keyof TShape & keyof T, T>(...keys: Array<K>): ObjType<RequiredType<TShape>, Required<T>> {
    const result = {} as ObjTypShape;
    const source = (keys.length === 0 ? this.shape : this.pickProps(keys as any)) as ObjTypShape;

    for (const key of Reflect.ownKeys(source)) {
      result[key] = flatExcludeKinds(source[key] as any, undef);
    }

    return obj({ ...this.shape, ...result }) as any;
  }

  // areEqual(other: Typ<unknown, unknown>, cache: ComparisonCache): boolean {
  //   const otherT = other as this;

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
