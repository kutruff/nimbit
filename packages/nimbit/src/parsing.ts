import { boolean } from './primitives';
import { type ParseOptions } from './types';

export type TypeConverter<TSource, TDestinationType> = (
  value: TSource,
  opts?: ParseOptions
) => ParseResult<TDestinationType>;

export const pass = <T>(value: T): ParseResult<T> => ({ success: true as const, value });

export const fail = (message?: string, error?: unknown) => ({
  success: false as const,
  message,
  error
});

// // TODO: see if wrapping throw is useful
// export const tryPass = <T>(action: () => T): ParseResult<T> => {
//   try {
//     return pass(action());
//   } catch (error) {
//     return fail(undefined, error);
//   }
// };

// export const passIf = <T>(value: T, isSuccess: boolean): ParseResult<T> => (isSuccess ? pass(value) : fail());

// export const verifier =
//   <T>(condition: (value: T) => boolean) =>
//   (x: T): ParseResult<T> =>
//     passIf(x, condition(x));

export type ParseResult<T> = { success: true; value: T } | { success: false; message?: string; error?: unknown };

export class ParseContext {
  path: string[] = [];

  push(key: string) {
    this.path.push(key);
  }
}
