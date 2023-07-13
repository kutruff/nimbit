import {
  array,
  boolean,
  coercion,
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
const jsonOutput = union(anyObject, array(unknown), string, number, boolean, nul);
export type json = Infer<typeof jsonOutput>;

export const json = coercion(jsonOutput, jsonParse);

export function jsonParse(value: string): ParseResult<json> {
  try {
    return pass(JSON.parse(value));
  } catch (err) {    
    return fail();
  }
}
