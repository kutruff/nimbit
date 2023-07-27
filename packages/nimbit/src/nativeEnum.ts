/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fail, pass, Typ, type ParseResult } from '.';

export type EnumLike = { [k: string]: string | number; [num: number]: string };

export function nativeEnum<TEnum extends EnumLike>(name: string, theEnum: TEnum): NativeEnumType<TEnum> {
  return new NativeEnumType(theEnum, name);
}
//Trick from Zod that will resolve an enum to itself, or spit out object keys
//type EnumOrObjectKeys<T> = T[keyof T]
export class NativeEnumType<TEnum> extends Typ<'nativeEnum', TEnum, TEnum[keyof TEnum]> {
  //TODO: may want to turn array into a Set for efficiency?
  constructor(theEnum: TEnum, name?: string) {
    super('nativeEnum', theEnum, name);
  }

  safeParse(value: unknown): ParseResult<TEnum[keyof TEnum]> {
    const shape = this.shape as EnumLike;

    for (const key of Object.keys(shape)) {
      const enumValue = shape[key]!;

      if (enumValue === value) {
        return typeof shape[enumValue] !== 'number' ? pass(enumValue as TEnum[keyof TEnum]) : fail();
      }
    }

    return fail();
  }
}
