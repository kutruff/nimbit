import { type ObjType, type ShapeDefinition } from '.';

export type StringKeys<T extends object> = Extract<keyof T, string>;
export const getKeys = <T extends object>(obj: T) => Object.keys(obj) as StringKeys<T>[];

export type ShapeKeys<T extends ObjType<unknown>> = Extract<keyof T['shape'], string>;
export const shapeKeys = <TShapeDefinition extends ShapeDefinition>(
  type: ObjType<TShapeDefinition>
): ShapeKeys<typeof type>[] => getKeys(type.shape);

export const shapeKeyMap = <TShapeDefinition extends ShapeDefinition>(type: ObjType<TShapeDefinition>) =>
  shapeKeys(type).reduce((acc, x) => ({ ...acc, [x]: x }), {}) as { [K in ShapeKeys<typeof type>]: K };
