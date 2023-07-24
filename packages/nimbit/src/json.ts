import {
  array,
  boolean,
  coerce,
  fail,
  nul,
  number,
  obj,
  pass,
  string,
  union,
  unknown,
  type Infer,
  type ParseResult
} from '.';

const anyObject = obj({}, undefined, false);

export const json = coerce(union(anyObject, array(unknown), string, number, boolean, nul), jsonParse);
export type json = Infer<typeof json>;

export function jsonParse(value: string): ParseResult<string | number | boolean | unknown[] | object | null> {
  try {
    return pass(JSON.parse(value));
  } catch (err) {
    return fail();
  }
}
