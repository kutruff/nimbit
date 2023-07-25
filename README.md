[![Build Size](https://img.shields.io/bundlephobia/minzip/nimbit?label=bundle%20size)](https://bundlephobia.com/result?p=nimbit)
[![Version](https://img.shields.io/npm/v/nimbit)](https://www.npmjs.com/package/nimbit)
[![Downloads](https://img.shields.io/npm/dt/nimbit.svg)](https://www.npmjs.com/package/nimbit)

# _Nimbit_

[![Build Size](https://img.shields.io/bundlephobia/minzip/nimbit?label=size)](https://bundlephobia.com/result?p=nimbit)

A very tiny Typescript type definition, validation, and reflection library - types are always introspectable no matter what validations you add to them.

The library is heavily inspired by Zod, and has all the best parts of Zod and but is very tiny and produces less noise in your code. The documentation here intentionally follows Zod's documentation part to help you transition from Zod to Nimbit.

This is in alpha. Still working on validation.

```bash
npm install nimbit
```

### `nimbit`

✅ Type definitions
✅ Validation
✅ Mutually recursive types

## Library Comparison

This comparison strives to be as accurate and as unbiased as possible. If you use any of these libraries and feel the information could be improved, feel free to suggest changes.

NOTE: THIS IS PLACEHOLDER. NEED TO VERIFY EACH CLAIM.

| [Nimbit](https://github.com/kutruff/nimbit)                                                                             | [Zod](https://github.com/colinhacks/zod)                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [![Build Size](https://img.shields.io/bundlephobia/minzip/nimbit?label=size)](https://bundlephobia.com/result?p=nimbit) | [![Build Size](https://img.shields.io/bundlephobia/minzip/zod?label=size)](https://bundlephobia.com/result?p=zod) |

|                                | [Nimbit](https://github.com/kutruff/nimbit) | [Zod](https://github.com/colinhacks/zod) |
| ------------------------------ | ------------------------------------------- | ---------------------------------------- |
| Type defintions                | ✅                                          | ✅                                       |
| Schema Validation              | ✅                                          | ✅                                       |
| Recursive Types without lazy() | ✅                                          | 🟥                                       |
| Cyclical Relationships         | Verify                                      | 🟥                                       |
| No parenthesis on types()      | ✅                                          | 🟥                                       |
| Reflection always guaranteed   | ✅                                          | 🟥                                       |
| Fluent                         | ✅                                          | ✅                                       |
| Immutable                      | ✅                                          | ✅                                       |
| Node + Browsers                | ✅                                          | ✅                                       |

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [From `npm` (Node/Bun)](#from-npm-nodebun)
  - [From `deno.land/x` (Deno)](#from-denolandx-deno)
- [Basic usage](#basic-usage)
- [Primitives](#primitives)
- [Coercion for primitives](#coercion-for-primitives)
- [Literals](#literals)
- [Strings](#strings)
  - [ISO datetimes](#iso-datetimes)
  - [IP addresses](#ip-addresses)
- [Numbers](#numbers)
- [BigInts](#bigints)
- [NaNs](#nans)
- [Booleans](#booleans)
- [Dates](#dates)
- [Zod enums](#zod-enums)
- [Native enums](#native-enums)
- [Optionals](#optionals)
- [Nullables](#nullables)
- [Objects](#objects)
  - [`.shape`](#shape)
  - [`.keyof`](#keyof)
  - [`.extend`](#extend)
  - [`.merge`](#merge)
  - [`.pick/.omit`](#pickomit)
  - [`.partial`](#partial)
  - [`.deepPartial`](#deeppartial)
  - [`.required`](#required)
  - [`.passthrough`](#passthrough)
  - [`.strict`](#strict)
  - [`.strip`](#strip)
  - [`.catchall`](#catchall)
- [Arrays](#arrays)
  - [`.element`](#element)
  - [`.nonempty`](#nonempty)
  - [`.min/.max/.length`](#minmaxlength)
- [Tuples](#tuples)
- [Unions](#unions)
- [Discriminated unions](#discriminated-unions)
- [Records](#records)
  - [Record key type](#record-key-type)
- [Maps](#maps)
- [Sets](#sets)
- [Intersections](#intersections)
- [Recursive types](#recursive-types)
  - [ZodType with ZodEffects](#zodtype-with-zodeffects)
  - [JSON type](#json-type)
  - [Cyclical objects](#cyclical-objects)
- [Promises](#promises)
- [Instanceof](#instanceof)
- [Functions](#functions)
- [Preprocess](#preprocess)
- [Custom schemas](#custom-schemas)
- [Schema methods](#schema-methods)
  - [`.parse`](#parse)
  - [`.parseAsync`](#parseasync)
  - [`.safeParse`](#safeparse)
  - [`.safeParseAsync`](#safeparseasync)
  - [`.refine`](#refine)
    - [Arguments](#arguments)
    - [Customize error path](#customize-error-path)
    - [Asynchronous refinements](#asynchronous-refinements)
    - [Relationship to transforms](#relationship-to-transforms)
  - [`.superRefine`](#superrefine)
    - [Abort early](#abort-early)
    - [Type refinements](#type-refinements)
  - [`.transform`](#transform)
    - [Chaining order](#chaining-order)
    - [Validating during transform](#validating-during-transform)
    - [Relationship to refinements](#relationship-to-refinements)
    - [Async transforms](#async-transforms)
  - [`.default`](#default)
  - [`.describe`](#describe)
  - [`.catch`](#catch)
  - [`.optional`](#optional)
  - [`.nullable`](#nullable)
  - [`.nullish`](#nullish)
  - [`.array`](#array)
  - [`.promise`](#promise)
  - [`.or`](#or)
  - [`.and`](#and)
  - [`.brand`](#brand)
  - [`.pipe()`](#pipe)
    - [You can use `.pipe()` to fix common issues with `z.coerce`.](#you-can-use-pipe-to-fix-common-issues-with-zcoerce)
- [Guides and concepts](#guides-and-concepts)
  - [Type inference](#type-inference)
  - [Writing generic functions](#writing-generic-functions)
    - [Constraining allowable inputs](#constraining-allowable-inputs)
  - [Error handling](#error-handling)
  - [Error formatting](#error-formatting)
- [Comparison](#comparison)
  - [Joi](#joi)
  - [Yup](#yup)
  - [io-ts](#io-ts)
  - [Runtypes](#runtypes)
  - [Ow](#ow)
- [Changelog](#changelog)

## Introduction

Nimbit is a TypeScript-first schema declaration and validation library just like Zod. However, it is extremely small and strives to keep as much functinality and typing in userland as possible. Furthermore, Nimbit ensures all types are always guaranteed to be reflected upon no matter what.

## Installation

### Requirements

- TypeScript 5.1+!
- You must enable `strict` mode in your `tsconfig.json`. This is a best practice for all TypeScript projects.

  ```ts
  // tsconfig.json
  {
    // ...
    "compilerOptions": {
      // ...
      "strict": true
    }
  }
  ```

### From `npm`

```sh
npm install zod       # npm
yarn add zod          # yarn
pnpm add zod          # pnpm
```

## Basic usage

Creating a simple string schema

```ts
import { t } from 'nimbit';

// creating a schema for strings
const mySchema = t.string;

// parsing
mySchema.parse('tuna'); // => {success: true; value: "tuna"}
mySchema.parse(12); // => {success: false}
```

Creating an object schema

```ts
import { t } from 'nimbit';

const User = t.obj({
  username: t.string
});

User.parse({ username: 'Ludwig' });

// extract the inferred type
type User = t.Infer<typeof User>;
// { username: string }
```

## Primitives

```ts
import { t } from 'nimbit';

// primitive values
t.string;
t.number;
t.bigint;
t.boolean;
t.date;
t.symbol;

// empty types
t.undef;
t.nul;

// catch-all types
// allows any value
t.any;
t.unknown;

// never type
// allows no values
t.never;
```

## Coercion for primitives

There are built in helpers for coercing primitive types.

```ts
t.asString.parse('tuna'); // => "tuna"
t.asString.parse(12); // => "12"
t.asString.parse(true); // => "true"
```

```ts
t.asString; // String(input)
t.asNumber; // Number(input)
t.asBoolean; // Boolean(input)
t.asBigint; // BigInt(input)
t.asDate; // new Date(input)
```

These coercion data types are full fledged Types equivalent to their output type. In other words, `areEqual(t.asString, t.string)` is `true`. The only difference is what happens when you call `parse().`

```ts
t.asString; // String(input)
t.asNumber; // Number(input)
t.asBoolean; // Boolean(input)
t.asBigint; // BigInt(input)
t.asDate; // new Date(input)
```

**Boolean coercion**

Nimbit's boolean coercion is very simple! It passes the value into the `Boolean(value)` function, that's it. Any truthy value will resolve to `true`, any falsy value will resolve to `false`.

```ts
t.asBoolean.parse('tuna'); // => true
t.asBoolean.parse('true'); // => true
t.asBoolean.parse('false'); // => true
t.asBoolean.parse(1); // => true
t.asBoolean.parse([]); // t.asBt.asBoolean.parse(0); // => false
t.asBoolean.parse(undefined); // => false
t.asBoolean.parse(null); // => false
```

### Custom coercion

Writing your own coercion is extremely easy.  For example, here is how the `asNumber` coercion is implemented:

```ts
const asNumber = coerce(t.number, (x: unknown) => {
  const result = Number(x);
  return !isNaN(result) ? pass(result) : fail();
});
```
The first argument is the output type of your coercion.  

If the coercion succeeds you just need to return `pass(value)`. If the coercion fails, return `fail()`.  You can also return `fail(message)` to provide a custom error message.

After that you can use `asNumber` any place you would use a `string`

## Literals

Literal schemas represent a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), like `"hello world"` or `5`.

```ts
const tuna = t.literal('tuna');
const twelve = t.literal(12);

const twobig = t.literal(2n); // bigint literal
const tru = t.literal(true);

const terrificSymbol = Symbol('terrific');
const terrific = z.literal(terrificSymbol);

// retrieve literal value
tuna.value; // "tuna"
```

## Strings

Zod includes a handful of string-specific validations.

```ts
//TODO: decide if these will be included.
// validations
z.string().max(5);
z.string().min(5);
z.string().length(5);
z.string().email();
z.string().url();
z.string().emoji();
z.string().uuid();
z.string().cuid();
z.string().cuid2();
z.string().ulid();
z.string().regex(regex);
z.string().includes(string);
z.string().startsWith(string);
z.string().endsWith(string);
z.string().datetime(); // defaults to UTC, see below for options
z.string().ip(); // defaults to IPv4 and IPv6, see below for options

// transformations
z.string().trim(); // trim whitespace
z.string().toLowerCase(); // toLowerCase
z.string().toUpperCase(); // toUpperCase
```

> Check out [validator.js](https://github.com/validatorjs/validator.js) for a bunch of other useful string validation functions that can be used in conjunction with [Refinements](#refine).

You can customize some common error messages when creating a string schema.

```ts
const name = z.string({
  required_error: 'Name is required',
  invalid_type_error: 'Name must be a string'
});
```

When using validation methods, you can pass in an additional argument to provide a custom error message.

```ts
z.string().min(5, { message: 'Must be 5 or more characters long' });
z.string().max(5, { message: 'Must be 5 or fewer characters long' });
z.string().length(5, { message: 'Must be exactly 5 characters long' });
z.string().email({ message: 'Invalid email address' });
z.string().url({ message: 'Invalid url' });
z.string().emoji({ message: 'Contains non-emoji characters' });
z.string().uuid({ message: 'Invalid UUID' });
z.string().includes('tuna', { message: 'Must include tuna' });
z.string().startsWith('https://', { message: 'Must provide secure URL' });
z.string().endsWith('.com', { message: 'Only .com domains allowed' });
z.string().datetime({ message: 'Invalid datetime string! Must be UTC.' });
z.string().ip({ message: 'Invalid IP address' });
```

### ISO datetimes

The `z.string().datetime()` method defaults to UTC validation: no timezone offsets with arbitrary sub-second decimal precision.

```ts
const datetime = z.string().datetime();

datetime.parse('2020-01-01T00:00:00Z'); // pass
datetime.parse('2020-01-01T00:00:00.123Z'); // pass
datetime.parse('2020-01-01T00:00:00.123456Z'); // pass (arbitrary precision)
datetime.parse('2020-01-01T00:00:00+02:00'); // fail (no offsets allowed)
```

Timezone offsets can be allowed by setting the `offset` option to `true`.

```ts
const datetime = z.string().datetime({ offset: true });

datetime.parse('2020-01-01T00:00:00+02:00'); // pass
datetime.parse('2020-01-01T00:00:00.123+02:00'); // pass (millis optional)
datetime.parse('2020-01-01T00:00:00.123+0200'); // pass (millis optional)
datetime.parse('2020-01-01T00:00:00.123+02'); // pass (only offset hours)
datetime.parse('2020-01-01T00:00:00Z'); // pass (Z still supported)
```

You can additionally constrain the allowable `precision`. By default, arbitrary sub-second precision is supported (but optional).

```ts
const datetime = z.string().datetime({ precision: 3 });

datetime.parse('2020-01-01T00:00:00.123Z'); // pass
datetime.parse('2020-01-01T00:00:00Z'); // fail
datetime.parse('2020-01-01T00:00:00.123456Z'); // fail
```

### IP addresses

The `z.string().ip()` method by default validate IPv4 and IPv6.

```ts
const ip = z.string().ip();

ip.parse('192.168.1.1'); // pass
ip.parse('84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003'); // pass
ip.parse('84d5:51a0:9114:1855:4cfa:f2d7:1f12:192.168.1.1'); // pass

ip.parse('256.1.1.1'); // fail
ip.parse('84d5:51a0:9114:gggg:4cfa:f2d7:1f12:7003'); // fail
```

You can additionally set the IP `version`.

```ts
const ipv4 = z.string().ip({ version: 'v4' });
ipv4.parse('84d5:51a0:9114:1855:4cfa:f2d7:1f12:7003'); // fail

const ipv6 = z.string().ip({ version: 'v6' });
ipv6.parse('192.168.1.1'); // fail
```

## Numbers

You can customize certain error messages when creating a number schema.

```ts
const age = z.number({
  required_error: 'Age is required',
  invalid_type_error: 'Age must be a number'
});
```

Zod includes a handful of number-specific validations.

```ts
z.number().gt(5);
z.number().gte(5); // alias .min(5)
z.number().lt(5);
z.number().lte(5); // alias .max(5)

z.number().int(); // value must be an integer

z.number().positive(); //     > 0
z.number().nonnegative(); //  >= 0
z.number().negative(); //     < 0
z.number().nonpositive(); //  <= 0

z.number().multipleOf(5); // Evenly divisible by 5. Alias .step(5)

z.number().finite(); // value must be finite, not Infinity or -Infinity
z.number().safe(); // value must be between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER
```

Optionally, you can pass in a second argument to provide a custom error message.

```ts
z.number().lte(5, { message: 'this👏is👏too👏big' });
```

## BigInts

Zod includes a handful of bigint-specific validations.

```ts
z.bigint().gt(5n);
z.bigint().gte(5n); // alias `.min(5n)`
z.bigint().lt(5n);
z.bigint().lte(5n); // alias `.max(5n)`

z.bigint().positive(); // > 0n
z.bigint().nonnegative(); // >= 0n
z.bigint().negative(); // < 0n
z.bigint().nonpositive(); // <= 0n

z.bigint().multipleOf(5n); // Evenly divisible by 5n.
```

## NaNs

You can customize certain error messages when creating a nan schema.

```ts
const isNaN = z.nan({
  required_error: 'isNaN is required',
  invalid_type_error: 'isNaN must be not a number'
});
```

## Booleans

You can customize certain error messages when creating a boolean schema.

```ts
const isActive = z.boolean({
  required_error: 'isActive is required',
  invalid_type_error: 'isActive must be a boolean'
});
```

## Dates

Use z.date() to validate `Date` instances.

```ts
z.date().safeParse(new Date()); // success: true
z.date().safeParse('2022-01-12T00:00:00.000Z'); // success: false
```

You can customize certain error messages when creating a date schema.

```ts
const myDateSchema = z.date({
  required_error: 'Please select a date and time',
  invalid_type_error: "That's not a date!"
});
```

Zod provides a handful of date-specific validations.

```ts
z.date().min(new Date('1900-01-01'), { message: 'Too old' });
z.date().max(new Date(), { message: 'Too young!' });
```

**Coercion to Date**

Since [zod 3.20](https://github.com/colinhacks/zod/releases/tag/v3.20), use [`z.coerce.date()`](#coercion-for-primitives) to pass the input through `new Date(input)`.

```ts
const dateSchema = z.coerce.date();
type DateSchema = z.infer<typeof dateSchema>;
// type DateSchema = Date

/* valid dates */
console.log(dateSchema.safeParse('2023-01-10T00:00:00.000Z').success); // true
console.log(dateSchema.safeParse('2023-01-10').success); // true
console.log(dateSchema.safeParse('1/10/23').success); // true
console.log(dateSchema.safeParse(new Date('1/10/23')).success); // true

/* invalid dates */
console.log(dateSchema.safeParse('2023-13-10').success); // false
console.log(dateSchema.safeParse('0000-00-00').success); // false
```

For older zod versions, use [`z.preprocess`](#preprocess) like [described in this thread](https://github.com/colinhacks/zod/discussions/879#discussioncomment-2036276).

## Zod enums

```ts
const FishEnum = z.enum(['Salmon', 'Tuna', 'Trout']);
type FishEnum = z.infer<typeof FishEnum>;
// 'Salmon' | 'Tuna' | 'Trout'
```

`z.enum` is a Zod-native way to declare a schema with a fixed set of allowable _string_ values. Pass the array of values directly into `z.enum()`. Alternatively, use `as const` to define your enum values as a tuple of strings. See the [const assertion docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) for details.

```ts
const VALUES = ['Salmon', 'Tuna', 'Trout'] as const;
const FishEnum = z.enum(VALUES);
```

This is not allowed, since Zod isn't able to infer the exact values of each element.

```ts
const fish = ['Salmon', 'Tuna', 'Trout'];
const FishEnum = z.enum(fish);
```

**Autocompletion**

To get autocompletion with a Zod enum, use the `.enum` property of your schema:

```ts
FishEnum.enum.Salmon; // => autocompletes

FishEnum.enum;
/*
=> {
  Salmon: "Salmon",
  Tuna: "Tuna",
  Trout: "Trout",
}
*/
```

You can also retrieve the list of options as a tuple with the `.options` property:

```ts
FishEnum.options; // ["Salmon", "Tuna", "Trout"];
```

## Native enums

Zod enums are the recommended approach to defining and validating enums. But if you need to validate against an enum from a third-party library (or you don't want to rewrite your existing enums) you can use `z.nativeEnum()`.

**Numeric enums**

```ts
enum Fruits {
  Apple,
  Banana
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // passes
FruitEnum.parse(Fruits.Banana); // passes
FruitEnum.parse(0); // passes
FruitEnum.parse(1); // passes
FruitEnum.parse(3); // fails
```

**String enums**

```ts
enum Fruits {
  Apple = 'apple',
  Banana = 'banana',
  Cantaloupe // you can mix numerical and string enums
}

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // Fruits

FruitEnum.parse(Fruits.Apple); // passes
FruitEnum.parse(Fruits.Cantaloupe); // passes
FruitEnum.parse('apple'); // passes
FruitEnum.parse('banana'); // passes
FruitEnum.parse(0); // passes
FruitEnum.parse('Cantaloupe'); // fails
```

**Const enums**

The `.nativeEnum()` function works for `as const` objects as well. ⚠️ `as const` requires TypeScript 3.4+!

```ts
const Fruits = {
  Apple: 'apple',
  Banana: 'banana',
  Cantaloupe: 3
} as const;

const FruitEnum = z.nativeEnum(Fruits);
type FruitEnum = z.infer<typeof FruitEnum>; // "apple" | "banana" | 3

FruitEnum.parse('apple'); // passes
FruitEnum.parse('banana'); // passes
FruitEnum.parse(3); // passes
FruitEnum.parse('Cantaloupe'); // fails
```

You can access the underlying object with the `.enum` property:

```ts
FruitEnum.enum.Apple; // "apple"
```

## Optionals

You can make any schema optional with `z.optional()`. This wraps the schema in a `ZodOptional` instance and returns the result.

```ts
const schema = z.optional(z.string());

schema.parse(undefined); // => returns undefined
type A = z.infer<typeof schema>; // string | undefined
```

For convenience, you can also call the `.optional()` method on an existing schema.

```ts
const user = z.object({
  username: z.string().optional()
});
type C = z.infer<typeof user>; // { username?: string | undefined };
```

You can extract the wrapped schema from a `ZodOptional` instance with `.unwrap()`.

```ts
const stringSchema = z.string();
const optionalString = stringSchema.optional();
optionalString.unwrap() === stringSchema; // true
```

## Nullables

Similarly, you can create nullable types with `z.nullable()`.

```ts
const nullableString = z.nullable(z.string());
nullableString.parse('asdf'); // => "asdf"
nullableString.parse(null); // => null
```

Or use the `.nullable()` method.

```ts
const E = z.string().nullable(); // equivalent to nullableString
type E = z.infer<typeof E>; // string | null
```

Extract the inner schema with `.unwrap()`.

```ts
const stringSchema = z.string();
const nullableString = stringSchema.nullable();
nullableString.unwrap() === stringSchema; // true
```

## Objects

```ts
// all properties are required by default
const Dog = z.object({
  name: z.string(),
  age: z.number(),
});

// extract the inferred type like this
type Dog = z.infer<typeof Dog>;

// equivalent to:
type Dog = {
  name: string;
  age: number;
};
```

### `.shape`

Use `.shape` to access the schemas for a particular key.

```ts
Dog.shape.name; // => string schema
Dog.shape.age; // => number schema
```

### `.keyof`

Use `.keyof` to create a `ZodEnum` schema from the keys of an object schema.

```ts
const keySchema = Dog.keyof();
keySchema; // ZodEnum<["name", "age"]>
```

### `.extend`

You can add additional fields to an object schema with the `.extend` method.

```ts
const DogWithBreed = Dog.extend({
  breed: z.string()
});
```

You can use `.extend` to overwrite fields! Be careful with this power!

### `.merge`

Equivalent to `A.extend(B.shape)`.

```ts
const BaseTeacher = z.object({ students: z.array(z.string()) });
const HasID = z.object({ id: z.string() });

const Teacher = BaseTeacher.merge(HasID);
type Teacher = z.infer<typeof Teacher>; // => { students: string[], id: string }
```

> If the two schemas share keys, the properties of B overrides the property of A. The returned schema also inherits the "unknownKeys" policy (strip/strict/passthrough) and the catchall schema of B.

### `.pick/.omit`

Inspired by TypeScript's built-in `Pick` and `Omit` utility types, all Zod object schemas have `.pick` and `.omit` methods that return a modified version. Consider this Recipe schema:

```ts
const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.string())
});
```

To only keep certain keys, use `.pick` .

```ts
const JustTheName = Recipe.pick({ name: true });
type JustTheName = z.infer<typeof JustTheName>;
// => { name: string }
```

To remove certain keys, use `.omit` .

```ts
const NoIDRecipe = Recipe.omit({ id: true });

type NoIDRecipe = z.infer<typeof NoIDRecipe>;
// => { name: string, ingredients: string[] }
```

### `.partial`

Inspired by the built-in TypeScript utility type [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype), the `.partial` method makes all properties optional.

Starting from this object:

```ts
const user = z.object({
  email: z.string()
  username: z.string(),
});
// { email: string; username: string }
```

We can create a partial version:

```ts
const partialUser = user.partial();
// { email?: string | undefined; username?: string | undefined }
```

You can also specify which properties to make optional:

```ts
const optionalEmail = user.partial({
  email: true
});
/*
{
  email?: string | undefined;
  username: string
}
*/
```

### `.deepPartial`

The `.partial` method is shallow — it only applies one level deep. There is also a "deep" version:

```ts
const user = z.object({
  username: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  strings: z.array(z.object({ value: z.string() }))
});

const deepPartialUser = user.deepPartial();

/*
{
  username?: string | undefined,
  location?: {
    latitude?: number | undefined;
    longitude?: number | undefined;
  } | undefined,
  strings?: { value?: string}[]
}
*/
```

> Important limitation: deep partials only work as expected in hierarchies of objects, arrays, and tuples.

### `.required`

Contrary to the `.partial` method, the `.required` method makes all properties required.

Starting from this object:

```ts
const user = z.object({
  email: z.string()
  username: z.string(),
}).partial();
// { email?: string | undefined; username?: string | undefined }
```

We can create a required version:

```ts
const requiredUser = user.required();
// { email: string; username: string }
```

You can also specify which properties to make required:

```ts
const requiredEmail = user.required({
  email: true
});
/*
{
  email: string;
  username?: string | undefined;
}
*/
```

### `.passthrough`

By default Zod object schemas strip out unrecognized keys during parsing.

```ts
const person = z.object({
  name: z.string()
});

person.parse({
  name: 'bob dylan',
  extraKey: 61
});
// => { name: "bob dylan" }
// extraKey has been stripped
```

Instead, if you want to pass through unknown keys, use `.passthrough()` .

```ts
person.passthrough().parse({
  name: 'bob dylan',
  extraKey: 61
});
// => { name: "bob dylan", extraKey: 61 }
```

### `.strict`

By default Zod object schemas strip out unrecognized keys during parsing. You can _disallow_ unknown keys with `.strict()` . If there are any unknown keys in the input, Zod will throw an error.

```ts
const person = z
  .object({
    name: z.string()
  })
  .strict();

person.parse({
  name: 'bob dylan',
  extraKey: 61
});
// => throws ZodError
```

### `.strip`

You can use the `.strip` method to reset an object schema to the default behavior (stripping unrecognized keys).

### `.catchall`

You can pass a "catchall" schema into an object schema. All unknown keys will be validated against it.

```ts
const person = z
  .object({
    name: z.string()
  })
  .catchall(z.number());

person.parse({
  name: 'bob dylan',
  validExtraKey: 61 // works fine
});

person.parse({
  name: 'bob dylan',
  validExtraKey: false // fails
});
// => throws ZodError
```

Using `.catchall()` obviates `.passthrough()` , `.strip()` , or `.strict()`. All keys are now considered "known".

## Arrays

```ts
const stringArray = z.array(z.string());

// equivalent
const stringArray = z.string().array();
```

Be careful with the `.array()` method. It returns a new `ZodArray` instance. This means the _order_ in which you call methods matters. For instance:

```ts
z.string().optional().array(); // (string | undefined)[]
z.string().array().optional(); // string[] | undefined
```

### `.element`

Use `.element` to access the schema for an element of the array.

```ts
stringArray.element; // => string schema
```

### `.nonempty`

If you want to ensure that an array contains at least one element, use `.nonempty()`.

```ts
const nonEmptyStrings = z.string().array().nonempty();
// the inferred type is now
// [string, ...string[]]

nonEmptyStrings.parse([]); // throws: "Array cannot be empty"
nonEmptyStrings.parse(['Ariana Grande']); // passes
```

You can optionally specify a custom error message:

```ts
// optional custom error message
const nonEmptyStrings = z.string().array().nonempty({
  message: "Can't be empty!"
});
```

### `.min/.max/.length`

```ts
z.string().array().min(5); // must contain 5 or more items
z.string().array().max(5); // must contain 5 or fewer items
z.string().array().length(5); // must contain 5 items exactly
```

Unlike `.nonempty()` these methods do not change the inferred type.

## Tuples

Unlike arrays, tuples have a fixed number of elements and each element can have a different type.

```ts
const athleteSchema = z.tuple([
  z.string(), // name
  z.number(), // jersey number
  z.object({
    pointsScored: z.number()
  }) // statistics
]);

type Athlete = z.infer<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

A variadic ("rest") argument can be added with the `.rest` method.

```ts
const variadicTuple = z.tuple([z.string()]).rest(z.number());
const result = variadicTuple.parse(['hello', 1, 2, 3]);
// => [string, ...number[]];
```

## Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse('foo'); // passes
stringOrNumber.parse(14); // passes
```

Zod will test the input against each of the "options" in order and return the first value that validates successfully.

For convenience, you can also use the [`.or` method](#or):

```ts
const stringOrNumber = z.string().or(z.number());
```

**Optional string validation:**

To validate an optional form input, you can union the desired string validation with an empty string [literal](#literals).

This example validates an input that is optional but needs to contain a [valid URL](#strings):

```ts
const optionalUrl = z.union([z.string().url().nullish(), z.literal('')]);

console.log(optionalUrl.safeParse(undefined).success); // true
console.log(optionalUrl.safeParse(null).success); // true
console.log(optionalUrl.safeParse('').success); // true
console.log(optionalUrl.safeParse('https://zod.dev').success); // true
console.log(optionalUrl.safeParse('not a valid url').success); // false
```

## Discriminated unions

A discriminated union is a union of object schemas that all share a particular key.

```ts
type MyUnion = { status: 'success'; data: string } | { status: 'failed'; error: Error };
```

Such unions can be represented with the `z.discriminatedUnion` method. This enables faster evaluation, because Zod can check the _discriminator key_ (`status` in the example above) to determine which schema should be used to parse the input. This makes parsing more efficient and lets Zod report friendlier errors.

With the basic union method, the input is tested against each of the provided "options", and in the case of invalidity, issues for all the "options" are shown in the zod error. On the other hand, the discriminated union allows for selecting just one of the "options", testing against it, and showing only the issues related to this "option".

```ts
const myUnion = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.string() }),
  z.object({ status: z.literal('failed'), error: z.instanceof(Error) })
]);

myUnion.parse({ status: 'success', data: 'yippie ki yay' });
```

## Records

Record schemas are used to validate types such as `{ [k: string]: number }`.

If you want to validate the _values_ of an object against some schema but don't care about the keys, use `z.record(valueType)`:

```ts
const NumberCache = z.record(z.number());

type NumberCache = z.infer<typeof NumberCache>;
// => { [k: string]: number }
```

This is particularly useful for storing or caching items by ID.

```ts
const userStore: UserStore = {};

userStore['77d2586b-9e8e-4ecf-8b21-ea7e0530eadd'] = {
  name: 'Carlotta'
}; // passes

userStore['77d2586b-9e8e-4ecf-8b21-ea7e0530eadd'] = {
  whatever: 'Ice cream sundae'
}; // TypeError
```

### Record key type

If you want to validate both the keys and the values, use
`z.record(keyType, valueType)`:

```ts
const NoEmptyKeysSchema = z.record(z.string().min(1), z.number());
NoEmptyKeysSchema.parse({ count: 1 }); // => { 'count': 1 }
NoEmptyKeysSchema.parse({ '': 1 }); // fails
```

_(Notice how when passing two arguments, `valueType` is the second argument)_

**A note on numerical keys**

While `z.record(keyType, valueType)` is able to accept numerical key types and TypeScript's built-in Record type is `Record<KeyType, ValueType>`, it's hard to represent the TypeScript type `Record<number, any>` in Zod.

As it turns out, TypeScript's behavior surrounding `[k: number]` is a little unintuitive:

```ts
const testMap: { [k: number]: string } = {
  1: 'one'
};

for (const key in testMap) {
  console.log(`${key}: ${typeof key}`);
}
// prints: `1: string`
```

As you can see, JavaScript automatically casts all object keys to strings under the hood. Since Zod is trying to bridge the gap between static and runtime types, it doesn't make sense to provide a way of creating a record schema with numerical keys, since there's no such thing as a numerical key in runtime JavaScript.

## Maps

```ts
const stringNumberMap = z.map(z.string(), z.number());

type StringNumberMap = z.infer<typeof stringNumberMap>;
// type StringNumberMap = Map<string, number>
```

## Sets

```ts
const numberSet = z.set(z.number());
type NumberSet = z.infer<typeof numberSet>;
// type NumberSet = Set<number>
```

Set schemas can be further constrained with the following utility methods.

```ts
z.set(z.string()).nonempty(); // must contain at least one item
z.set(z.string()).min(5); // must contain 5 or more items
z.set(z.string()).max(5); // must contain 5 or fewer items
z.set(z.string()).size(5); // must contain 5 items exactly
```

## Intersections

Intersections are useful for creating "logical AND" types. This is useful for intersecting two object types.

```ts
const Person = z.object({
  name: z.string(),
});

const Employee = z.object({
  role: z.string(),
});

const EmployedPerson = z.intersection(Person, Employee);

// equivalent to:
const EmployedPerson = Person.and(Employee);
```

Though in many cases, it is recommended to use `A.merge(B)` to merge two objects. The `.merge` method returns a new `ZodObject` instance, whereas `A.and(B)` returns a less useful `ZodIntersection` instance that lacks common object methods like `pick` and `omit`.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);
const c = z.intersection(a, b);

type c = z.infer<typeof c>; // => number
```

<!-- Intersections in Zod are not smart. Whatever data you pass into `.parse()` gets passed into the two intersected schemas. Because Zod object schemas don't allow any unknown keys by default, there are some unintuitive behavior surrounding intersections of object schemas. -->

<!--

``` ts
const A = z.object({
  a: z.string(),
});

const B = z.object({
  b: z.string(),
});

const AB = z.intersection(A, B);

type Teacher = z.infer<typeof Teacher>;
// { id:string; name:string };
```  -->

## Recursive types

You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred. Instead you'll need to define the type definition manually, and provide it to Zod as a "type hint".

```ts
const baseCategorySchema = z.object({
  name: z.string()
});

type Category = z.infer<typeof baseCategorySchema> & {
  subcategories: Category[];
};

const categorySchema: z.ZodType<Category> = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array())
});

categorySchema.parse({
  name: 'People',
  subcategories: [
    {
      name: 'Politicians',
      subcategories: [
        {
          name: 'Presidents',
          subcategories: []
        }
      ]
    }
  ]
}); // passes
```

Thanks to [crasite](https://github.com/crasite) for this example.

### ZodType with ZodEffects

When using `z.ZodType` with `z.ZodEffects` (
[`.refine`](https://github.com/colinhacks/zod#refine),
[`.transform`](https://github.com/colinhacks/zod#transform),
[`preprocess`](https://github.com/colinhacks/zod#preprocess),
etc...
), you will need to define the input and output types of the schema. `z.ZodType<Output, z.ZodTypeDef, Input>`

```ts
const isValidId = (id: string): id is `${string}/${string}` => id.split('/').length === 2;

const baseSchema = z.object({
  id: z.string().refine(isValidId)
});

type Input = z.input<typeof baseSchema> & {
  children: Input[];
};

type Output = z.output<typeof baseSchema> & {
  children: Output[];
};

const schema: z.ZodType<Output, z.ZodTypeDef, Input> = baseSchema.extend({
  children: z.lazy(() => schema.array())
});
```

Thanks to [marcus13371337](https://github.com/marcus13371337) and [JoelBeeldi](https://github.com/JoelBeeldi) for this example.

### JSON type

If you want to validate any JSON value, you can use the snippet below.

```ts
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]));

jsonSchema.parse(data);
```

Thanks to [ggoodman](https://github.com/ggoodman) for suggesting this.

### Cyclical objects

Despite supporting recursive schemas, passing cyclical data into Zod will cause an infinite loop.

## Promises

```ts
const numberPromise = z.promise(z.number());
```

"Parsing" works a little differently with promise schemas. Validation happens in two parts:

1. Zod synchronously checks that the input is an instance of Promise (i.e. an object with `.then` and `.catch` methods.).
2. Zod uses `.then` to attach an additional validation step onto the existing Promise. You'll have to use `.catch` on the returned Promise to handle validation failures.

```ts
numberPromise.parse('tuna');
// ZodError: Non-Promise type: string

numberPromise.parse(Promise.resolve('tuna'));
// => Promise<number>

const test = async () => {
  await numberPromise.parse(Promise.resolve('tuna'));
  // ZodError: Non-number type: string

  await numberPromise.parse(Promise.resolve(3.14));
  // => 3.14
};
```

<!-- #### Non-native promise implementations

When "parsing" a promise, Zod checks that the passed value is an object with `.then` and `.catch` methods — that's it. So you should be able to pass non-native Promises (Bluebird, etc) into `z.promise(...).parse` with no trouble. One gotcha: the return type of the parse function will be a _native_ `Promise` , so if you have downstream logic that uses non-standard Promise methods, this won't work. -->

## Instanceof

You can use `z.instanceof` to check that the input is an instance of a class. This is useful to validate inputs against classes that are exported from third-party libraries.

```ts
class Test {
  name: string;
}

const TestSchema = z.instanceof(Test);

const blob: any = 'whatever';
TestSchema.parse(new Test()); // passes
TestSchema.parse('blob'); // throws
```

## Functions

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` .

```ts
const myFunction = z.function();

type myFunction = z.infer<typeof myFunction>;
// => ()=>unknown
```

Define inputs and outputs.

```ts
const myFunction = z
  .function()
  .args(z.string(), z.number()) // accepts an arbitrary number of arguments
  .returns(z.boolean());

type myFunction = z.infer<typeof myFunction>;
// => (arg0: string, arg1: number)=>boolean
```

<!--

``` ts
const args = z.tuple([z.string()]);

const returnType = z.number();

const myFunction = z.function(args, returnType);
type myFunction = z.infer<typeof myFunction>;
// => (arg0: string)=>number
``` -->

Function schemas have an `.implement()` method which accepts a function and returns a new function that automatically validates its inputs and outputs.

```ts
const trimmedLength = z
  .function()
  .args(z.string()) // accepts an arbitrary number of arguments
  .returns(z.number())
  .implement(x => {
    // TypeScript knows x is a string!
    return x.trim().length;
  });

trimmedLength('sandwich'); // => 8
trimmedLength(' asdf '); // => 4
```

If you only care about validating inputs, just don't call the `.returns()` method. The output type will be inferred from the implementation.

> You can use the special `z.void()` option if your function doesn't return anything. This will let Zod properly infer the type of void-returning functions. (Void-returning functions actually return undefined.)

```ts
const myFunction = z
  .function()
  .args(z.string())
  .implement(arg => {
    return [arg.length];
  });

myFunction; // (arg: string)=>number[]
```

Extract the input and output schemas from a function schema.

```ts
myFunction.parameters();
// => ZodTuple<[ZodString, ZodNumber]>

myFunction.returnType();
// => ZodBoolean
```

<!-- `z.function()` accepts two arguments:

* `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
* `returnType: any Zod schema` The second argument is the function's return type. This can be any Zod schema. -->

## Preprocess

> Zod now supports primitive coercion without the need for `.preprocess()`. See the [coercion docs](#coercion-for-primitives) for more information.

Typically Zod operates under a "parse then transform" paradigm. Zod validates the input first, then passes it through a chain of transformation functions. (For more information about transforms, read the [.transform docs](#transform).)

But sometimes you want to apply some transform to the input _before_ parsing happens. A common use case: type coercion. Zod enables this with the `z.preprocess()`.

```ts
const castToString = z.preprocess(val => String(val), z.string());
```

This returns a `ZodEffects` instance. `ZodEffects` is a wrapper class that contains all logic pertaining to preprocessing, refinements, and transforms.

## Custom schemas

You can create a Zod schema for any TypeScript type by using `z.custom()`. This is useful for creating schemas for types that are not supported by Zod out of the box, such as template string literals.

```ts
const px = z.custom<`${number}px`>(val => {
  return /^\d+px$/.test(val as string);
});

type px = z.infer<typeof px>; // `${number}px`

px.parse('42px'); // "42px"
px.parse('42vw'); // throws;
```

If you don't provide a validation function, Zod will allow any value. This can be dangerous!

```ts
z.custom<{ arg: string }>(); // performs no validation
```

You can customize the error message and other options by passing a second argument. This parameter works the same way as the params parameter of [`.refine`](#refine).

```ts
z.custom<...>((val) => ..., "custom error message");
```

## Schema methods

All Zod schemas contain certain methods.

### `.parse`

`.parse(data: unknown): T`

Given any Zod schema, you can call its `.parse` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

> IMPORTANT: The value returned by `.parse` is a _deep clone_ of the variable you passed in.

```ts
const stringSchema = z.string();

stringSchema.parse('fish'); // => returns "fish"
stringSchema.parse(12); // throws error
```

### `.parseAsync`

`.parseAsync(data:unknown): Promise<T>`

If you use asynchronous [refinements](#refine) or [transforms](#transform) (more on those later), you'll need to use `.parseAsync`.

```ts
const stringSchema = z.string().refine(async val => val.length <= 8);

await stringSchema.parseAsync('hello'); // => returns "hello"
await stringSchema.parseAsync('hello world'); // => throws error
```

### `.safeParse`

`.safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ZodError; }`

If you don't want Zod to throw errors when validation fails, use `.safeParse`. This method returns an object containing either the successfully parsed data or a ZodError instance containing detailed information about the validation problems.

```ts
stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse('billie');
// => { success: true; data: 'billie' }
```

The result is a _discriminated union_, so you can handle errors very conveniently:

```ts
const result = stringSchema.safeParse('billie');
if (!result.success) {
  // handle error then return
  result.error;
} else {
  // do something
  result.data;
}
```

### `.safeParseAsync`

> Alias: `.spa`

An asynchronous version of `safeParse`.

```ts
await stringSchema.safeParseAsync('billie');
```

For convenience, this has been aliased to `.spa`:

```ts
await stringSchema.spa('billie');
```

### `.refine`

`.refine(validator: (data:T)=>any, params?: RefineParams)`

Zod lets you provide custom validation logic via _refinements_. (For advanced features like creating multiple issues and customizing error codes, see [`.superRefine`](#superrefine).)

Zod was designed to mirror TypeScript as closely as possible. But there are many so-called "refinement types" you may wish to check for that can't be represented in TypeScript's type system. For instance: checking that a number is an integer or that a string is a valid email address.

For example, you can define a custom validation check on _any_ Zod schema with `.refine` :

```ts
const myString = z.string().refine(val => val.length <= 255, {
  message: "String can't be more than 255 characters"
});
```

> ⚠️ Refinement functions should not throw. Instead they should return a falsy value to signal failure.

#### Arguments

As you can see, `.refine` takes two arguments.

1. The first is the validation function. This function takes one input (of type `T` — the inferred type of the schema) and returns `any`. Any truthy value will pass validation. (Prior to zod@1.6.2 the validation function had to return a boolean.)
2. The second argument accepts some options. You can use this to customize certain error-handling behavior:

```ts
type RefineParams = {
  // override error message
  message?: string;

  // appended to error path
  path?: (string | number)[];

  // params object you can use to customize message
  // in error map
  params?: object;
};
```

For advanced cases, the second argument can also be a function that returns `RefineParams`.

```ts
const longString = z.string().refine(
  val => val.length > 10,
  val => ({ message: `${val} is not more than 10 characters` })
);
```

#### Customize error path

```ts
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string()
  })
  .refine(data => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'] // path of error
  });

passwordForm.parse({ password: 'asdf', confirm: 'qwer' });
```

Because you provided a `path` parameter, the resulting error will be:

```ts
ZodError {
  issues: [{
    "code": "custom",
    "path": [ "confirm" ],
    "message": "Passwords don't match"
  }]
}
```

#### Asynchronous refinements

Refinements can also be async:

```ts
const userId = z.string().refine(async id => {
  // verify that ID exists in database
  return true;
});
```

> ⚠️ If you use async refinements, you must use the `.parseAsync` method to parse data! Otherwise Zod will throw an error.

#### Relationship to transforms

Transforms and refinements can be interleaved:

```ts
z.string()
  .transform(val => val.length)
  .refine(val => val > 25);
```

<!-- Note that the `path` is set to `["confirm"]` , so you can easily display this error underneath the "Confirm password" textbox.

```ts
const allForms = z.object({ passwordForm }).parse({
  passwordForm: {
    password: "asdf",
    confirm: "qwer",
  },
});
```

would result in

```

ZodError {
  issues: [{
    "code": "custom",
    "path": [ "passwordForm", "confirm" ],
    "message": "Passwords don't match"
  }]
}
``` -->

### `.superRefine`

The `.refine` method is actually syntactic sugar atop a more versatile (and verbose) method called `superRefine`. Here's an example:

```ts
const Strings = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: 'array',
      inclusive: true,
      message: 'Too many items 😡'
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicates allowed.`
    });
  }
});
```

You can add as many issues as you like. If `ctx.addIssue` is _not_ called during the execution of the function, validation passes.

Normally refinements always create issues with a `ZodIssueCode.custom` error code, but with `superRefine` it's possible to throw issues of any `ZodIssueCode`. Each issue code is described in detail in the Error Handling guide: [ERROR_HANDLING.md](ERROR_HANDLING.md).

#### Abort early

By default, parsing will continue even after a refinement check fails. For instance, if you chain together multiple refinements, they will all be executed. However, it may be desirable to _abort early_ to prevent later refinements from being executed. To achieve this, pass the `fatal` flag to `ctx.addIssue` and return `z.NEVER`.

```ts
const schema = z.number().superRefine((val, ctx) => {
  if (val < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'should be >= 10',
      fatal: true
    });

    return z.NEVER;
  }

  if (val !== 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'should be twelve'
    });
  }
});
```

#### Type refinements

If you provide a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) to `.refine()` or `.superRefine()`, the resulting type will be narrowed down to your predicate's type. This is useful if you are mixing multiple chained refinements and transformations:

```ts
const schema = z
  .object({
    first: z.string(),
    second: z.number()
  })
  .nullable()
  .superRefine((arg, ctx): arg is { first: string; second: number } => {
    if (!arg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom, // customize your issue
        message: 'object should exist'
      });
    }

    return z.NEVER; // The return value is not used, but we need to return something to satisfy the typing
  })
  // here, TS knows that arg is not null
  .refine(arg => arg.first === 'bob', '`first` is not `bob`!');
```

> ⚠️ You **must** use `ctx.addIssue()` instead of returning a boolean value to indicate whether the validation passes. If `ctx.addIssue` is _not_ called during the execution of the function, validation passes.

### `.transform`

To transform data after parsing, use the `transform` method.

```ts
const stringToNumber = z.string().transform(val => val.length);

stringToNumber.parse('string'); // => 6
```

#### Chaining order

Note that `stringToNumber` above is an instance of the `ZodEffects` subclass. It is NOT an instance of `ZodString`. If you want to use the built-in methods of `ZodString` (e.g. `.email()`) you must apply those methods _before_ any transforms.

```ts
const emailToDomain = z
  .string()
  .email()
  .transform(val => val.split('@')[1]);

emailToDomain.parse('colinhacks@example.com'); // => example.com
```

#### Validating during transform

The `.transform` method can simultaneously validate and transform the value. This is often simpler and less duplicative than chaining `transform` and `refine`.

As with `.superRefine`, the transform function receives a `ctx` object with an `addIssue` method that can be used to register validation issues.

```ts
const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Not a number'
    });

    // This is a special symbol you can use to
    // return early from the transform function.
    // It has type `never` so it does not affect the
    // inferred return type.
    return z.NEVER;
  }
  return parsed;
});
```

#### Relationship to refinements

Transforms and refinements can be interleaved. These will be executed in the order they are declared.

```ts
const nameToGreeting = z
  .string()
  .transform(val => val.toUpperCase())
  .refine(val => val.length > 15)
  .transform(val => `Hello ${val}`)
  .refine(val => val.indexOf('!') === -1);
```

#### Async transforms

Transforms can also be async.

```ts
const IdToUser = z
  .string()
  .uuid()
  .transform(async id => {
    return await getUserById(id);
  });
```

> ⚠️ If your schema contains asynchronous transforms, you must use .parseAsync() or .safeParseAsync() to parse data. Otherwise Zod will throw an error.

### `.default`

You can use transforms to implement the concept of "default values" in Zod.

```ts
const stringWithDefault = z.string().default('tuna');

stringWithDefault.parse(undefined); // => "tuna"
```

Optionally, you can pass a function into `.default` that will be re-executed whenever a default value needs to be generated:

```ts
const numberWithRandomDefault = z.number().default(Math.random);

numberWithRandomDefault.parse(undefined); // => 0.4413456736055323
numberWithRandomDefault.parse(undefined); // => 0.1871840107401901
numberWithRandomDefault.parse(undefined); // => 0.7223408162401552
```

Conceptually, this is how Zod processes default values:

1. If the input is `undefined`, the default value is returned
2. Otherwise, the data is parsed using the base schema

### `.describe`

Use `.describe()` to add a `description` property to the resulting schema.

```ts
const documentedString = z.string().describe('A useful bit of text, if you know what to do with it.');
documentedString.description; // A useful bit of text…
```

This can be useful for documenting a field, for example in a JSON Schema using a library like [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)).

### `.catch`

Use `.catch()` to provide a "catch value" to be returned in the event of a parsing error.

```ts
const numberWithCatch = z.number().catch(42);

numberWithCatch.parse(5); // => 5
numberWithCatch.parse('tuna'); // => 42
```

Optionally, you can pass a function into `.catch` that will be re-executed whenever a default value needs to be generated. A `ctx` object containing the caught error will be passed into this function.

```ts
const numberWithRandomCatch = z.number().catch(ctx => {
  ctx.error; // the caught ZodError
  return Math.random();
});

numberWithRandomCatch.parse('sup'); // => 0.4413456736055323
numberWithRandomCatch.parse('sup'); // => 0.1871840107401901
numberWithRandomCatch.parse('sup'); // => 0.7223408162401552
```

Conceptually, this is how Zod processes "catch values":

1. The data is parsed using the base schema
2. If the parsing fails, the "catch value" is returned

### `.optional`

A convenience method that returns an optional version of a schema.

```ts
const optionalString = z.string().optional(); // string | undefined

// equivalent to
z.optional(z.string());
```

### `.nullable`

A convenience method that returns a nullable version of a schema.

```ts
const nullableString = z.string().nullable(); // string | null

// equivalent to
z.nullable(z.string());
```

### `.nullish`

A convenience method that returns a "nullish" version of a schema. Nullish schemas will accept both `undefined` and `null`. Read more about the concept of "nullish" [in the TypeScript 3.7 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing).

```ts
const nullishString = z.string().nullish(); // string | null | undefined

// equivalent to
z.string().optional().nullable();
```

### `.array`

A convenience method that returns an array schema for the given type:

```ts
const stringArray = z.string().array(); // string[]

// equivalent to
z.array(z.string());
```

### `.promise`

A convenience method for promise types:

```ts
const stringPromise = z.string().promise(); // Promise<string>

// equivalent to
z.promise(z.string());
```

### `.or`

A convenience method for [union types](#unions).

```ts
const stringOrNumber = z.string().or(z.number()); // string | number

// equivalent to
z.union([z.string(), z.number()]);
```

### `.and`

A convenience method for creating intersection types.

```ts
const nameAndAge = z.object({ name: z.string() }).and(z.object({ age: z.number() })); // { name: string } & { age: number }

// equivalent to
z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() }));
```

### `.brand`

`.brand<T>() => ZodBranded<this, B>`

TypeScript's type system is structural, which means that any two types that are structurally equivalent are considered the same.

```ts
type Cat = { name: string };
type Dog = { name: string };

const petCat = (cat: Cat) => {};
const fido: Dog = { name: 'fido' };
petCat(fido); // works fine
```

In some cases, its can be desirable to simulate _nominal typing_ inside TypeScript. For instance, you may wish to write a function that only accepts an input that has been validated by Zod. This can be achieved with _branded types_ (AKA _opaque types_).

```ts
const Cat = z.object({ name: z.string() }).brand<'Cat'>();
type Cat = z.infer<typeof Cat>;

const petCat = (cat: Cat) => {};

// this works
const simba = Cat.parse({ name: 'simba' });
petCat(simba);

// this doesn't
petCat({ name: 'fido' });
```

Under the hood, this works by attaching a "brand" to the inferred type using an intersection type. This way, plain/unbranded data structures are no longer assignable to the inferred type of the schema.

```ts
const Cat = z.object({ name: z.string() }).brand<'Cat'>();
type Cat = z.infer<typeof Cat>;
// {name: string} & {[symbol]: "Cat"}
```

Note that branded types do not affect the runtime result of `.parse`. It is a static-only construct.

### `.pipe()`

Schemas can be chained into validation "pipelines". It's useful for easily validating the result after a `.transform()`:

```ts
z.string()
  .transform(val => val.length)
  .pipe(z.number().min(5));
```

The `.pipe()` method returns a `ZodPipeline` instance.

#### You can use `.pipe()` to fix common issues with `z.coerce`.

You can constrain the input to types that work well with your chosen coercion. Then use `.pipe()` to apply the coercion.

without constrained input:

```ts
const toDate = z.coerce.date();

// works intuitively
console.log(toDate.safeParse('2023-01-01').success); // true

// might not be what you want
console.log(toDate.safeParse(null).success); // true
```

with constrained input:

```ts
const datelike = z.union([z.number(), z.string(), z.date()]);
const datelikeToDate = datelike.pipe(z.coerce.date());

// still works intuitively
console.log(datelikeToDate.safeParse('2023-01-01').success); // true

// more likely what you want
console.log(datelikeToDate.safeParse(null).success); // false
```

You can also use this technique to avoid coercions that throw uncaught errors.

without constrained input:

```ts
const toBigInt = z.coerce.bigint();

// works intuitively
console.log(toBigInt.safeParse('42')); // true

// probably not what you want
console.log(toBigInt.safeParse(null)); // throws uncaught error
```

with constrained input:

```ts
const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const toBigInt = z.bigint().or(toNumber).pipe(z.coerce.bigint());

// still works intuitively
console.log(toBigInt.safeParse('42').success); // true

// error handled by zod, more likely what you want
console.log(toBigInt.safeParse(null).success); // false
```

## Guides and concepts

### Type inference

You can extract the TypeScript type of any schema with `z.infer<typeof mySchema>` .

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = "asdf"; // compiles
```

**What about transforms?**

In reality each Zod schema internally tracks **two** types: an input and an output. For most schemas (e.g. `z.string()`) these two are the same. But once you add transforms into the mix, these two values can diverge. For instance `z.string().transform(val => val.length)` has an input of `string` and an output of `number`.

You can separately extract the input and output types like so:

```ts
const stringToNumber = z.string().transform(val => val.length);

// ⚠️ Important: z.infer returns the OUTPUT type!
type input = z.input<typeof stringToNumber>; // string
type output = z.output<typeof stringToNumber>; // number

// equivalent to z.output!
type inferred = z.infer<typeof stringToNumber>; // number
```

### Writing generic functions

When attempting to write a function that accepts a Zod schema as an input, it's common to try something like this:

```ts
function makeSchemaOptional<T>(schema: z.ZodType<T>) {
  return schema.optional();
}
```

This approach has some issues. The `schema` variable in this function is typed as an instance of `ZodType`, which is an abstract class that all Zod schemas inherit from. This approach loses type information, namely _which subclass_ the input actually is.

```ts
const arg = makeSchemaOptional(z.string());
arg.unwrap();
```

A better approach is for the generic parameter to refer to _the schema as a whole_.

```ts
function makeSchemaOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}
```

> `ZodTypeAny` is just a shorthand for `ZodType<any, any, any>`, a type that is broad enough to match any Zod schema.

As you can see, `schema` is now fully and properly typed.

```ts
const arg = makeSchemaOptional(z.string());
arg.unwrap(); // ZodString
```

#### Constraining allowable inputs

The `ZodType` class has three generic parameters.

```ts
class ZodType<
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> { ... }
```

By constraining these in your generic input, you can limit what schemas are allowable as inputs to your function:

```ts
function makeSchemaOptional<T extends z.ZodType<string>>(schema: T) {
  return schema.optional();
}

makeSchemaOptional(z.string());
// works fine

makeSchemaOptional(z.number());
// Error: 'ZodNumber' is not assignable to parameter of type 'ZodType<string, ZodTypeDef, string>'
```

### Error handling

Zod provides a subclass of Error called `ZodError`. ZodErrors contain an `issues` array containing detailed information about the validation problems.

```ts
const result = z
  .object({
    name: z.string()
  })
  .safeParse({ name: 12 });

if (!result.success) {
  result.error.issues;
  /* [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [ "name" ],
        "message": "Expected string, received number"
      }
  ] */
}
```

> For detailed information about the possible error codes and how to customize error messages, check out the dedicated error handling guide: [ERROR_HANDLING.md](ERROR_HANDLING.md)

Zod's error reporting emphasizes _completeness_ and _correctness_. If you are looking to present a useful error message to the end user, you should either override Zod's error messages using an error map (described in detail in the Error Handling guide) or use a third-party library like [`zod-validation-error`](https://github.com/causaly/zod-validation-error)

### Error formatting

You can use the `.format()` method to convert this error into a nested object.

```ts
const result = z
  .object({
    name: z.string()
  })
  .safeParse({ name: 12 });

if (!result.success) {
  const formatted = result.error.format();
  /* {
    name: { _errors: [ 'Expected string, received number' ] }
  } */

  formatted.name?._errors;
  // => ["Expected string, received number"]
}
```

## Comparison

There are a handful of other widely-used validation libraries, but all of them have certain design limitations that make for a non-ideal developer experience.

<!-- The table below summarizes the feature differences. Below the table there are more involved discussions of certain alternatives, where necessary. -->

<!-- | Feature                                                                                                                | [Zod](https://github.com/colinhacks) | [Joi](https://github.com/hapijs/joi) | [Yup](https://github.com/jquense/yup) | [io-ts](https://github.com/gcanti/io-ts) | [Runtypes](https://github.com/pelotom/runtypes) | [ow](https://github.com/sindresorhus/ow) | [class-validator](https://github.com/typestack/class-validator) |
| ---------------------------------------------------------------------------------------------------------------------- | :-----------------------------: | :----------------------------------: | :-----------------------------------: | :--------------------------------------: | :---------------------------------------------: | :--------------------------------------: | :-------------------------------------------------------------: |
| <abbr title='Any ability to extract a TypeScript type from a validator instance counts.'>Type inference</abbr>         |               🟢                |                  🔴                  |                  🟢                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |
| <abbr title="Yup's inferred types are incorrect in certain cases, see discussion below.">Correct type inference</abbr> |               🟢                |                  🔴                  |                  🔴                   |                    🟢                    |                       🟢                        |                    🟢                    |                               🟢                                |

<abbr title="number, string, boolean, null, undefined">Primitive Types</abbr>
<abbr title="Includes any checks beyond 'Is this a string?', e.g. min/max length, isEmail, isURL, case checking, etc.">String Validation</abbr>
<abbr title="Includes any checks beyond 'Is this a number?', e.g. min/max, isPositive, integer vs float, etc.">Number Validation</abbr>
Dates

Primitive Literals
Object Literals
Tuple Literals
Objects
Arrays
Non-empty arrays
Unions
Optionals
Nullable
Enums
Enum Autocomplete
Intersections
Object Merging
Tuples
Recursive Types
Function Schemas

<abbr title="For instance, Yup allows custom error messages with the syntax yup.number().min(5, 'Number must be more than 5!')">Validation Messages</abbr>
Immutable instances
Type Guards
Validity Checking
Casting
Default Values
Rich Errors
Branded -->

<!-- - Missing object methods: (pick, omit, partial, deepPartial, merge, extend)

* Missing nonempty arrays with proper typing (`[T, ...T[]]`)
* Missing lazy/recursive types
* Missing promise schemas
* Missing function schemas
* Missing union & intersection schemas
* Missing support for parsing cyclical data (maybe)
* Missing error customization -->

### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

Doesn't support static type inference 😕

### Yup

[https://github.com/jquense/yup](https://github.com/jquense/yup)

Yup is a full-featured library that was implemented first in vanilla JS, and later rewritten in TypeScript.

- Supports casting and transforms
- All object fields are optional by default
- Missing object methods: (partial, deepPartial)
<!-- - Missing nonempty arrays with proper typing (`[T, ...T[]]`) -->
- Missing promise schemas
- Missing function schemas
- Missing union & intersection schemas

<!-- ¹Yup has a strange interpretation of the word `required`. Instead of meaning "not undefined", Yup uses it to mean "not empty". So `yup.string().required()` will not accept an empty string, and `yup.array(yup.string()).required()` will not accept an empty array. Instead, Yup us Zod arrays there is a dedicated `.nonempty()` method to indicate this, or you can implement it with a custom refinement. -->

### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

io-ts is an excellent library by gcanti. The API of io-ts heavily inspired the design of Zod.

In our experience, io-ts prioritizes functional programming purity over developer experience in many cases. This is a valid and admirable design goal, but it makes io-ts particularly hard to integrate into an existing codebase with a more procedural or object-oriented bias. For instance, consider how to define an object with optional properties in io-ts:

```ts
import * as t from 'io-ts';

const A = t.type({
  foo: t.string
});

const B = t.partial({
  bar: t.number
});

const C = t.intersection([A, B]);

type C = t.TypeOf<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

You must define the required and optional props in separate object validators, pass the optionals through `t.partial` (which marks all properties as optional), then combine them with `t.intersection` .

Consider the equivalent in Zod:

```ts
const C = z.object({
  foo: z.string(),
  bar: z.number().optional()
});

type C = z.infer<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

This more declarative API makes schema definitions vastly more concise.

`io-ts` also requires the use of gcanti's functional programming library `fp-ts` to parse results and handle errors. This is another fantastic resource for developers looking to keep their codebase strictly functional. But depending on `fp-ts` necessarily comes with a lot of intellectual overhead; a developer has to be familiar with functional programming concepts and the `fp-ts` nomenclature to use the library.

- Supports codecs with serialization & deserialization transforms
- Supports branded types
- Supports advanced functional programming, higher-kinded types, `fp-ts` compatibility
- Missing object methods: (pick, omit, partial, deepPartial, merge, extend)
- Missing nonempty arrays with proper typing (`[T, ...T[]]`)
- Missing promise schemas
- Missing function schemas

### Runtypes

[https://github.com/pelotom/runtypes](https://github.com/pelotom/runtypes)

Good type inference support, but limited options for object type masking (no `.pick` , `.omit` , `.extend` , etc.). No support for `Record` s (their `Record` is equivalent to Zod's `object` ). They DO support readonly types, which Zod does not.

- Supports "pattern matching": computed properties that distribute over unions
- Supports readonly types
- Missing object methods: (deepPartial, merge)
- Missing nonempty arrays with proper typing (`[T, ...T[]]`)
- Missing promise schemas
- Missing error customization

### Ow

[https://github.com/sindresorhus/ow](https://github.com/sindresorhus/ow)

Ow is focused on function input validation. It's a library that makes it easy to express complicated assert statements, but it doesn't let you parse untyped data. They support a much wider variety of types; Zod has a nearly one-to-one mapping with TypeScript's type system, whereas ow lets you validate several highly-specific types out of the box (e.g. `int32Array` , see full list in their README).

If you want to validate function inputs, use function schemas in Zod! It's a much simpler approach that lets you reuse a function type declaration without repeating yourself (namely, copy-pasting a bunch of ow assertions at the beginning of every function). Also Zod lets you validate your return types as well, so you can be sure there won't be any unexpected data passed downstream.

## Changelog

View the changelog at [CHANGELOG.md](CHANGELOG.md)
