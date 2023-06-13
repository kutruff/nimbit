import { areEqual } from './areEqual';
import {
  ElementType,
  IObjectDefinition,
  ObjType,
  Prop,
  ToDefinitionType,
  ToTsType,
  Types,
  UnionType,
  makeOptional,
  makeReadonly,
  makeRequired,
  makeWritable,
  nevr,
  obj,
  prop,
  undef
} from './index';
import { union } from './union';

export type Intersection<ObjTypeA, ObjTypeB> = ToDefinitionType<ToTsType<ObjTypeA> & ToTsType<ObjTypeB>>;

export function intersection<TObjectDefintionA extends IObjectDefinition, TObjectDefinitionB extends IObjectDefinition>(
  objectTypeA: ObjType<TObjectDefintionA>,
  objectTypeB: ObjType<TObjectDefinitionB>
): Intersection<typeof objectTypeA, typeof objectTypeB> {
  const merged = {} as IObjectDefinition;

  const objectDefinitionA = objectTypeA.objectDefinition;
  const objectDefinitionB = objectTypeB.objectDefinition;

  const allKeysInAB = [...new Set(Object.keys(objectDefinitionA).concat(Object.keys(objectDefinitionB)))];

  for (const key of allKeysInAB) {
    const propertyA = objectDefinitionA[key];
    const propertyB = objectDefinitionB[key];

    if (propertyA == null && propertyB != null) {
      merged[key] = propertyB;
    } else if (propertyA != null && propertyB == null) {
      merged[key] = propertyA;
    } else if (propertyA != null && propertyB != null) {
      switch (propertyA.type.kind) {
        case 'object': {
          if (propertyB.type.kind !== 'object') {
            return nevr as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
          }
          merged[key] = prop(intersection(propertyA.type, propertyB.type) as any);
          break;
        }
        default: {
          //TODO: what happens with optional and readonly props?
          if (areEqual(propertyA.type, propertyB.type)) {
            merged[key] = prop(propertyA.type);
          } else {
            return nevr as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
          }
          break;
        }
      }
    }
  }

  const result = obj(merged);
  return result as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
}

export type PartialType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, unknown, infer R> ? Prop<T, true, R> : never;
};

export function partial<T extends IObjectDefinition>(objType: ObjType<T>): ObjType<PartialType<T>> {
  const result = {} as IObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeOptional(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<PartialType<T>>;
}

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, unknown, infer R> ? Prop<T, false, R> : never;
};

export function required<T extends IObjectDefinition>(objType: ObjType<T>) {
  const result = {} as IObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeRequired(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<RequiredType<T>>;
}

export type ReadonlyType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, true> : never;
};

export function readonly<T extends IObjectDefinition>(objType: ObjType<T>): ObjType<ReadonlyType<T>> {
  const result = {} as IObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeReadonly(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<ReadonlyType<T>>;
}

export type WritableType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, false> : never;
};

export function writable<T extends IObjectDefinition>(objType: ObjType<T>): ObjType<WritableType<T>> {
  const result = {} as IObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeWritable(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<WritableType<T>>;
}

export function pick<T extends IObjectDefinition, K extends keyof T>(
  objectDefinition: ObjType<T>,
  ...keys: Array<K>
): ObjType<Pick<T, K>> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = objectDefinition.objectDefinition[key];
  }

  return obj(result) as ObjType<Pick<T, K>>;
}

export function omit<T extends IObjectDefinition, K extends keyof T>(
  objectDefinition: ObjType<T>,
  ...keys: Array<K>
): ObjType<Omit<T, K>> {
  const result = { ...objectDefinition.objectDefinition };

  for (const key of keys) {
    delete result[key];
  }

  return obj(result) as ObjType<Omit<T, K>>;
}

export function exclude<T extends Types, K extends Types[]>(unionType: UnionType<T>, ...types: K) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => !types.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return nevr;
  }

  return union(result as UnionType<Exclude<T, ElementType<K>>>);
}

export function extract<T extends Types, K extends Types[]>(unionType: UnionType<T>, ...keys: K) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => keys.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return nevr;
  }

  return union(result as UnionType<Extract<T, ElementType<K>>>);
}

// type NameTypeAsLiteral<TsType> =
//     TsType extends StringLiteral<TsType>// `${string & TsType}`
//     ? TsType
//     : TsType extends string
//     ? 'string'
//     : TsType extends number
//     ? 'number'
//     : TsType extends bigint
//     ? 'bigint'
//     : TsType extends boolean
//     ? 'boolean'
//     : TsType extends null
//     ? 'null'
//     : TsType extends undefined
//     ? 'undefined'
//     : TsType extends Array<infer Element>
//     ? `${NameTypeAsLiteral<Element>}[]`
//     : TsType extends object
//     ? 'obj found'
//     : never;

// type TypeToLiteral<T> = `${NameTypeAsLiteral<T>}`;
