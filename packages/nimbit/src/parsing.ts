export type TypeConverter<TSource, TDestinationType> = (value: TSource) => ParseResult<TDestinationType>;

export function pass<T>(value: T): ParseResult<T> {
  return { [_result]: 1, success: true as const, data: value } as const;
}

export function fail(error?: ParseError) {
  return {
    [_result]: 1,
    success: false,
    error: error ?? { kind: 'general', message: undefined }
  } as const;
}
export const _result: unique symbol = Symbol();
export type ParseSuccess<T> = {
  [_result]: 1;
  success: true;
  data: T;
};

export type ParseFail = {
  [_result]: 1;
  success: false;
  // message?: string;
  error: ParseError;
};

// export interface ErrorWithChildren<T> = {
//   //Any property that begins with "child" will be traversed by the visitor.
// };

export type ParseResult<T> = ParseSuccess<T> | ParseFail;

export type ParseError = ParseErrorTypes[keyof ParseErrorTypes];

export interface ParseErrorTypes {
  WrongType: WrongTypeError;
  General: GeneralError;
  Condition: ConditionError;
  Union: UnionParseError;
  Array: ArrayError;
  Map: MapError;
  Thrown: ThrownError;
  Set: SetParseError;
}

export interface WrongTypeError {
  kind: 'wrong-type';
  expected: string;
  message?: string;
  actual: unknown;
}
export interface UnionParseError {
  kind: 'union';
  errors: ParseError[];
}

export interface SetParseError {
  kind: 'union';
  errors: ParseError[];
}

export interface GeneralError {
  kind: 'general';
  message?: string;
}

export interface ThrownError {
  kind: 'thrown';
  error: unknown;
  message?: string;
}

export interface ConditionError {
  kind: 'condition';
  actual: unknown;
  message?: string;
}

export interface MapError {
  kind: 'map' | 'record';
  keyErrors: ArrayErrorIndex;
  valueErrors: ArrayErrorIndex;
}

export type ArrayErrorIndex = Array<[index: number, value: ParseError]>;

export interface ArrayError {
  kind: 'array' | 'tuple' | 'set';
  errors: ArrayErrorIndex;
}
export function failWrongType(expected: string, actual: unknown, message?: string) {
  return fail(wrongTypeError(expected, actual, message));
}

export function wrongTypeError(expected: string, actual: unknown, message?: string): WrongTypeError {
  return { kind: 'wrong-type', expected, actual, message };
}

// declare module '../message' {
//   // Where you define MessageTypes
//   interface ParseErrorTypes {
//     WrongType: WrongTypeError;
//   }
// }

export function recordIfFailed(errors: ArrayErrorIndex, i: number, result: ParseResult<unknown>) {
  if (!result.success) {
    errors.push([i, result.error]);
  }
}

// export interface Issue {
//   path: PropertyKey[];
//   error: ParseError;
// }

// export class ParseContext {
//   path: PropertyKey[] = [];
//   issues: Issue[] = [];

//   push<T>(key: PropertyKey, func: () => T) {
//     try {
//       this.path.push(key);
//       return func();
//     } finally {
//       this.path.pop();
//     }
//   }
//   pop() {
//     this.path.pop();
//   }

//   addIssue(error: ParseError) {
//     this.issues.push({ path: this.path.slice(), error });
//   }
// }

// TODO: see if wrapping throw is useful
// export function tryPass<T>(action: () => T): ParseResult<T> {
//   try {
//     return pass(action());
//   } catch (error) {
//     return fail({ kind: 'thrown', error });
//   }
// }

//TODO: add Targs to this

// export function resolveError<T>(value: T, defaultError: ParseError, error: ErrorParameter<T> | undefined): ParseError {
//   return error === undefined || typeof error === 'string' ? defaultError : error(value);
// }

// export function failWithErrorParams<T>(
//   errorParams: ErrorParameter<T> | undefined,
//   value: T,
//   defaultError: (value: T, message?: string) => ParseError
// ): ParseFail {
//   if (errorParams === undefined || typeof errorParams === 'string') {
//     return fail(defaultError(value, errorParams));
//   } else {
//     const result = errorParams(value);

//     return fail(typeof result === 'string' ? { kind: 'general', message: result } : result);
//   }
//   // return fail(
//   //   errorParams === undefined || typeof errorParams === 'string' ? defaultError(value, errorParams) : errorParams(value)
//   // );
// }

// export function resolveParseError<T>(error: ErrorParameter<T> | undefined, value: T): ParseError | undefined {
//   return error === undefined || typeof error === 'string' ? undefined : error(value);
// }

// export function tryPass<T, R>(action: (value: T) => R, customError?: ErrorParameter<T>): (value: T) => ParseResult<R> {
//   return (value: T) => {
//     try {
//       return pass(action(value));
//     } catch (error) {
//       return failWithErrorParams(customError, value, (_value, message) => ({ kind: 'thrown', error, message }));
//     }
//   };
// }

// export const passIf = <T>(value: T, isSuccess: boolean): ParseResult<T> => (isSuccess ? pass(value) : fail());

// export const verifier =
//   <T>(condition: (value: T) => boolean) =>
//   (x: T): ParseResult<T> =>
//     condition(x) ? pass(x) : fail();

// // export const length = (min: number, max: number) =>
// //   verifier((x: { length: number }) => x.length >= min && x.length <= max);
// export const length = (min: number, max: number) => (x: { length: number }) => x.length >= min && x.length <= max;
// export const minLength = (min: number) => (x: { length: number }) => x.length >= min;
// export const maxLength = (max: number) => (x: { length: number }) => x.length <= max;

// export const range = (min: number, max: number) => (x: number | bigint) => x >= min && x <= max;
// export const min = (min: number) => (x: number | bigint) => x >= min;
// export const max = (max: number) => (x: number | bigint) => x <= max;

// export const stringMatch = (regex: RegExp) => string.where(x => regex.test(x));

// // //all of these where taken from Zod.
// export const cuid = stringMatch(/^c[^\s-]{8,}$/i);
// export const cuid2 = stringMatch(/^[a-z][a-z0-9]*$/);
// export const ulid = stringMatch(/[0-9A-HJKMNP-TV-Z]{26}/);
// export const uuid = stringMatch(
//   /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i
// );
// export const email = stringMatch(/^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i);
// export const emoji = stringMatch(/^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u);

// export const ipv4 = stringMatch(
//   /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/
// );
// export const ipv6 = stringMatch(
//   /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/
// );
