import {
  any,
  array,
  boolean,
  coerce,
  fail,
  nul,
  number,
  obj,
  pass,
  PropertyPolicy,
  record,
  string,
  union,
  unionRef,
  unknown,
  type Infer,
  type ParseResult
} from '.';

const anyObject = obj({}, undefined, PropertyPolicy.passthrough);

export const json = coerce(union(anyObject, array(unknown), string, number, boolean, nul), jsonParse);

// class JSonObjDef {
//   literals = union(string, number, boolean, nul);
//   obj = record(string, this.literals);
//   // arr = array(obj(JSonObjDef).shape.schema);
//   schema = union(this.literals, record(string, obj(JSonObjDef)));
// }

// class ArrayDef {
//   element = JsonUnionDef;
// }

// class JsonSchema {
//   members = [string, number, boolean, nul, array(unionRef(JsonSchema)), record(string, unionRef(JsonSchema))];
// }

function JsonSchema()  {
  return [string, number, boolean, nul, array(unionRef(JsonSchema)), record(string, unionRef(JsonSchema))];
}
const result = unionRef(JsonSchema);

// class JSonRecordDef {
//   key = string;
//   value = UnionDef;
// }

// class JSonSchemaDef {
//   key = string;
//   value = UnionDef;
// }

// export const jsonBase = coerce(union(anyObject, array(unknown), string, number, boolean, nul), jsonParse);

// export const json = any.to(any, x => json.parse(jsonParse) )

export type json = Infer<typeof json>;

export function jsonParse(x: string): ParseResult<string | number | boolean | unknown[] | object | null> {
  try {
    return pass(JSON.parse(x));
  } catch (err) {
    return fail();
  }
}

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
