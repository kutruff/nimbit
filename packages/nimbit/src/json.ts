import {
  array,
  boolean,
  coerce,
  fail,
  nul,
  number,
  pass,
  string,
  union,
  type Infer,
  type LazyType,
  type ParseResult
} from '.';
import { lazy } from './lazy';
import { record } from './record';

// const anyObject = obj({}, undefined, PropertyPolicy.passthrough);
// const base = union(anyObject, array(unknown), string, number, boolean, nul);
// export const jsonOld = coerce(base, jsonParse);
// // export const looped = jsonOld.to(jsonOld, x => pass(x));
// function parseJsonDeep(x: string) {
//   const top = jsonOld.parse(x);
//   if (top.success) {
//     const isArray = top.value.parse(top.value)
//     if(
//   }
// }

const Literals = union(string, number, boolean, nul);
type JsonLiterals = Infer<typeof Literals>;

type json = JsonLiterals | json[] | { [key: string]: json };

const jsonSchema: LazyType<json> = lazy(() => union(Literals, array(jsonSchema), record(string, jsonSchema)));

export const json = coerce(jsonSchema, jsonParse);

export function jsonParse(x: string): ParseResult<json> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return pass(JSON.parse(x, (key, value) => (key === '__proto__' ? undefined : value)));
  } catch (err) {
    return fail();
  }
}

// const jsonSchema: UnionType<
//   [typeof Literals, ArrayType<unknown, Array<json>>, RecordType<StringT, unknown, Record<string, unknown>>],
//   json
// > = {} as any;

// const jsonSchema: UnionType<
//   [typeof Literals, ArrayType<unknown, Array<json>>, RecordType<StringT, unknown, Record<string, unknown>>],
//   json
// > = lazy(x => {
//   return union(Literals, array(x), record(string, x));
// });

// const result = jsonSchema.parse({ prop: 1 });

// const jsonSchema: UnionType<
//   [typeof Literals, ArrayType<unknown, Array<json>>, RecordType<StringT, unknown, Record<string, unknown>>],
//   json
// > = makeRecursive(() => {
//   return union(Literals, array(jsonSchema), record(string, jsonSchema));
// });

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
