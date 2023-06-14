import { ObjType, ShapeDefinition } from '.';

export type StringKeys<T extends object> = Extract<keyof T, string>;
export const getKeys = <T extends object>(obj: T) => Object.keys(obj) as StringKeys<T>[];

export type ShapeKeys<T extends ObjType<unknown>> = Extract<keyof T['shape'], string>;
export const shapeKeys = <TShapeDefinition extends ShapeDefinition>(type: ObjType<TShapeDefinition>) =>
  getKeys(type.shape) as ShapeKeys<typeof type>[];

export const shapeKeyMap = <TShapeDefinition extends ShapeDefinition>(type: ObjType<TShapeDefinition>) =>
  shapeKeys(type).reduce((acc, x) => ({ ...acc, [x]: x }), {}) as { [key in ShapeKeys<typeof type>]: key };
