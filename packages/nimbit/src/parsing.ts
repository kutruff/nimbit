export type TypeConverter<TSource, TDestinationType> = (value: TSource) => ParseResult<TDestinationType>;

export function pass<T>(value: T): ParseResult<T> {
  return { success: true as const, data: value };
}

export function fail(error?: ParseError) {
  return {
    success: false as const,
    error: error ?? { kind: 'general', message: undefined }
  };
}

export type ParseSuccess<T> = {
  success: true;
  data: T;
};

export type ParseFail = {
  success: false;
  message?: string;
  error: ParseError;
};

export type ParseResult<T> = ParseSuccess<T> | ParseFail;

export type ParseError = ParseErrorTypes[keyof ParseErrorTypes];

export interface ParseErrorTypes {
  WrongType: WrongTypeError;
  General: GeneralError;
  Condition: ConditionError;
  Array: ArrayError;
  Map: MapError;
}

export interface GeneralError {
  kind: 'general';
  message?: string;
}

export interface ConditionError {
  kind: 'condition';
  message?: string;
}

export interface MapError {
  kind: 'map' | 'record';
  keyErrors: ArrayErrorIndex;
  valueErrors: ArrayErrorIndex;
}

export type ArrayErrorIndex = Array<[index: number, value: ParseError]>;

export interface WrongTypeError {
  kind: 'wrong-type';
  expected: string;
  actual: string;
}

export function failWrongType(expected: string, actual: unknown) {
  return fail({ kind: 'wrong-type', expected, actual: typeof actual });
}

export interface ArrayError {
  kind: 'array' | 'tuple' | 'set';
  errors: ArrayErrorIndex;
}
// declare module '../message' {
//   // Where you define MessageTypes
//   interface ParseErrorTypes {
//     WrongType: WrongTypeError;
//   }
// }

// export interface NimbitError<TKind> {
//   kind: TKind;
// }

export function recordIfFailed(errorIndex: ArrayErrorIndex, i: number, result: ParseResult<unknown>) {
  if (!result.success) {
    errorIndex.push([i, result.error]);
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
