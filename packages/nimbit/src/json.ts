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

export function jsonParse(x: string): ParseResult<string | number | boolean | unknown[] | object | null> {
  try {
    return pass(JSON.parse(x));
  } catch (err) {
    return fail();
  }
}

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

//TODO: look into declaration merging for allowing extension of the fluent interface
//https://tanstack.com/router/v1/docs/guide/type-safety#exported-hooks-components-and-utilities

// // Adapted from https://stackoverflow.com/a/3143231
// const datetimeRegex = (args: { precision: number | null; offset: boolean }) => {
//   if (args.precision) {
//     if (args.offset) {
//       return new RegExp(
//         `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`
//       );
//     } else {
//       return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
//     }
//   } else if (args.precision === 0) {
//     if (args.offset) {
//       return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
//     } else {
//       return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
//     }
//   } else {
//     if (args.offset) {
//       return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
//     } else {
//       return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
//     }
//   }
// };
