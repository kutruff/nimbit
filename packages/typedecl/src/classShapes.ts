/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getKeys, obj, type Constructor, type ShapeDefParamsToObjType } from '.';

export type ShapeClassToShapeDefParams<T extends Constructor> = ShapeInstanceToShapeDefParams<InstanceType<T>>;

type ShapeInstanceToShapeDefParams<T> = {
  [P in keyof T]: T[P] extends Constructor ? ShapeDefParamsToObjType<ShapeClassToShapeDefParams<T[P]>> : T[P];
};

//Only need one obj type for all instances of a class
const constructorsToObj = new WeakMap();

//Converts a class defintion of a shape to and ObjType. Allows for recursion, and makes sure that
//  recursive references are to the same object throughout the program.
export function objFromClass<T extends Constructor>(
  constructor: T
): ShapeDefParamsToObjType<ShapeInstanceToShapeDefParams<InstanceType<T>>> {
  if (constructorsToObj.has(constructor)) {
    return constructorsToObj.get(constructor) as ShapeDefParamsToObjType<ShapeClassToShapeDefParams<T>>;
  }
  const instance = new constructor() as unknown as ShapeClassToShapeDefParams<T>;

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
