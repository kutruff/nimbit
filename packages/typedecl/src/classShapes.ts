/* eslint-disable @typescript-eslint/no-explicit-any */
import { getKeys, obj, type Constructor, type ShapeDefinitionToObjType } from '.';

export type ShapeClassToShapeDefinition<T extends Constructor> = ShapeInstanceToShapeDefinition<InstanceType<T>>;

type ShapeInstanceToShapeDefinition<T> = {
  [P in keyof T]: T[P] extends Constructor ? ShapeDefinitionToObjType<ShapeClassToShapeDefinition<T[P]>> : T[P];
};

//Only need one obj type for all instances of a class
const constructorsToObj = new WeakMap();

//Converts a class defintion of a shape to and ObjType. Allows for recursion, and makes sure that
//  recursive references are to the same object throughout the program.
export function objFromClass<T extends Constructor>(
  constructor: T
): ShapeDefinitionToObjType<ShapeInstanceToShapeDefinition<InstanceType<T>>> {
  if (constructorsToObj.has(constructor)) {
    return constructorsToObj.get(constructor) as ShapeDefinitionToObjType<ShapeClassToShapeDefinition<T>>;
  }
  const instance = new constructor() as unknown as ShapeClassToShapeDefinition<T>;

  const asObj = obj(instance);
  constructorsToObj.set(constructor, asObj);

  for (const key of getKeys(instance)) {
    const value = instance[key];
    if (typeof value === 'function') {
      asObj.shape[key].type = objFromClass(value as any) as any;
    }
    // else if (value && typeof value === 'object' && 'kind' in value) {
    //   switch (value.kind) {
    //     case 'array':
    //   }
    // } else {
    //   //TODO: hopefully class definitions can have string typing returned.
    //   throw new Error(`unexpected value in object class definition ${constructor}, ${key}, ${value}`);
    // }
  }

  return asObj;
}
