import { areEqual } from './areEqual';
import {
  ElementType,
  ObjType,
  ObjectDefinition,
  Prop,
  Type,
  UnionType,
  makeOptional,
  makeReadonly,
  makeRequired,
  makeWritable,
  never,
  obj,
  prop
} from './index';
import { union } from './union';

export type Intersection<ObjTypeA, ObjTypeB> = ObjTypeA & ObjTypeB;

export function intersection<TObjectDefintionA extends ObjectDefinition, TObjectDefinitionB extends ObjectDefinition>(
  objectTypeA: ObjType<TObjectDefintionA>,
  objectTypeB: ObjType<TObjectDefinitionB>
): Intersection<typeof objectTypeA, typeof objectTypeB> {
  const merged = {} as ObjectDefinition;

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
            return never as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
          }

          merged[key] = prop(intersection(propertyA.type as any, propertyB.type as any) as any);
          break;
        }
        default: {
          //TODO: what happens with optional and readonly props?
          if (areEqual(propertyA.type, propertyB.type)) {
            merged[key] = prop(propertyA.type);
          } else {
            return never as unknown as Intersection<typeof objectTypeA, typeof objectTypeB>;
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

export function partial<T extends ObjectDefinition>(objType: ObjType<T>): ObjType<PartialType<T>> {
  const result = {} as ObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeOptional(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<PartialType<T>>;
}

export type RequiredType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, unknown, infer R> ? Prop<T, false, R> : never;
};

export function required<T extends ObjectDefinition>(objType: ObjType<T>) {
  const result = {} as ObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeRequired(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<RequiredType<T>>;
}

export type ReadonlyType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, true> : never;
};

export function readonly<T extends ObjectDefinition>(objType: ObjType<T>): ObjType<ReadonlyType<T>> {
  const result = {} as ObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeReadonly(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<ReadonlyType<T>>;
}

export type WritableType<T> = {
  [P in keyof T]: T[P] extends Prop<infer T, infer O, unknown> ? Prop<T, O, false> : never;
};

export function writable<T extends ObjectDefinition>(objType: ObjType<T>): ObjType<WritableType<T>> {
  const result = {} as ObjectDefinition;

  for (const key of Object.keys(objType.objectDefinition)) {
    result[key] = makeWritable(objType.objectDefinition[key] as any);
  }

  return obj(result) as ObjType<WritableType<T>>;
}

export function pick<T extends ObjectDefinition, K extends keyof T>(
  objectDefinition: ObjType<T>,
  ...keys: Array<K>
): ObjType<Pick<T, K>> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = objectDefinition.objectDefinition[key];
  }

  return obj(result) as ObjType<Pick<T, K>>;
}

export function omit<T extends ObjectDefinition, K extends keyof T>(
  objectDefinition: ObjType<T>,
  ...keys: Array<K>
): ObjType<Omit<T, K>> {
  const result = { ...objectDefinition.objectDefinition };

  for (const key of keys) {
    delete result[key];
  }

  return obj(result) as ObjType<Omit<T, K>>;
}

export function exclude<T extends Type, K extends Type[]>(unionType: UnionType<T>, ...types: K) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => !types.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return never;
  }

  return union(result as UnionType<Exclude<T, ElementType<K>>>);
}

export function extract<T extends Type, K extends Type[]>(unionType: UnionType<T>, ...keys: K) {
  const result = { ...unionType, memberTypes: unionType.memberTypes.filter(x => keys.find(k => areEqual(x, k))) };

  if (result.memberTypes.length === 0) {
    return never;
  }

  return union(result as UnionType<Extract<T, ElementType<K>>>);
}
