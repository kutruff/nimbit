<p align="center">  
  <h1 align="center">Nimbit</h1>
  <p align="center">        
    Ultra-tiny TypeScript schema validation with static type inference and guaranteed reflection.
  </p>
  <p align="center">            
    <a href="https://img.shields.io/bundlephobia/minzip/nimbit@latest?label=bundle%20size"><img src="https://img.shields.io/bundlephobia/minzip/nimbit?label=size"" alt="Nimbit Size" /></a>
    <a href="https://github.com/kutruff/nimbit/actions?query=branch%3Amain"><img src="https://github.com/kutruff/nimbit/actions/workflows/ci.yml/badge.svg?event=push&branch=main" alt="Nimbit CI status" /></a>
  </p>
</p>

<!-- # Nimbit -->

<!-- <h1 style="text-align: center;">Nimbit</h1> -->
<!--
[![Build Size](https://img.shields.io/bundlephobia/minzip/nimbit@latest?label=bundle%20size)](https://bundlephobia.com/result?p=nimbit@latest)
[![Version](https://img.shields.io/npm/v/nimbit)](https://www.npmjs.com/package/nimbit)
[![Downloads](https://img.shields.io/npm/dt/nimbit.svg)](https://www.npmjs.com/package/nimbit) -->

<!--
[![Build Size](https://img.shields.io/bundlephobia/minzip/nimbit@latest?label=size)](https://bundlephobia.com/result?p=nimbit@latest) -->

```bash
npm install nimbit
```

Nimbit is an evolution of Zod's excellent design, and has all the best parts of Zod with a bunch of improvements.

    ✅ Super tiny footprint.
    ✅ Less noise in your code - no longer need parenthesis everywhere.
    ✅ Reflection/introspection always guaranteed.
    ✅ Object recursion and mutual recursion is more natural and easy.
    ✅ Coercion and pipelining are streamlined.
    ✅ Everything is pushed to userland as much as possible.

Nimbit is in alpha.

|                                       [Nimbit](https://github.com/kutruff/nimbit)                                       |                                     [Zod](https://github.com/colinhacks/zod)                                      |
| :---------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------: |
| [![Build Size](https://img.shields.io/bundlephobia/minzip/nimbit?label=size)](https://bundlephobia.com/result?p=nimbit) | [![Build Size](https://img.shields.io/bundlephobia/minzip/zod?label=size)](https://bundlephobia.com/result?p=zod) |

<!-- ## Library Features and Comparison

This comparison strives to be as accurate and as unbiased as possible. Feel free to point out discrepancies and suggest changes.

NOTE: THIS IS PLACEHOLDER. NEED TO VERIFY EACH CLAIM.



|                                                  | [Nimbit](https://github.com/kutruff/nimbit) | [Zod](https://github.com/colinhacks/zod) |
| :----------------------------------------------- | :-----------------------------------------: | :--------------------------------------: |
| Type defintions                                  |                     ✅                      |                    ✅                    |
| Schema validation                                |                     ✅                      |                    ✅                    |
| Recursive objects types with automatic TS types! |                     ✅                      |                    🟥                    |
| No parenthesis on types                          |                     ✅                      |                    🟥                    |
| Reflection always guaranteed                     |                     ✅                      |                    🟥                    |
| Cyclical relationships                           |                     TBD                     |                    🟥                    |
| General recursive types                          |                     ✅                      |                    ✅                    |
| Fluent                                           |                     ✅                      |                    ✅                    |
| Immutable                                        |                     ✅                      |                    ✅                    |
| Node + Browsers                                  |                     ✅                      |                    ✅                    |
| Types defined in userland                        |                     ✅                      |               Investigate                | -->

## Docs

The documentation here is a modified snap of Zod's documentation to help compare Nimbit to Zod.

**TLDR;** Zod differentiators: [Recursive Objects](#recursive-objects), [Objects](#objects), [`to()`](#to-for-user-defined-coercion-and-parsing)

- [Introduction](#introduction)
  - [Requirements](#requirements)
  - [From `npm`](#from-npm)
- [Basic usage](#basic-usage)
- [Primitives](#primitives)
- [Basic Coercion](#basic-coercion)
  - [`where()` for basic validation](#where-for-basic-validation)
  - [`to()` for user defined coercion and parsing](#to-for-user-defined-coercion-and-parsing)
- [Objects](#objects)
  - [`.shape`](#shape)
  - [`.k`](#k)
  - [`.passthrough()`](#passthrough)
  - [`.strict`](#strict)
  - [`.strip()`](#strip)
  - [`.catchall()`](#catchall)
- [Type methods](#type-methods)
  - [`.parse()`](#parse)
  - [`.safeParse()`](#safeparse)
  - [`.where()`](#where)
  - [`.tweak()`](#tweak)
  - [`.default()`](#default)
  - [`.catch()`](#catch)
  - [`.opt()`](#opt)
  - [`.nullable()`](#nullable)
  - [`.nullish()`](#nullish)
  - [Reflection](#reflection)
    - [`.kind`](#kind)
    - [`.name` / `withName()`](#name--withname)
- [Manipulating Types](#manipulating-types)
  - [`extend()`](#extend)
  - [`merge()`](#merge)
  - [`pick()/omit()`](#pickomit)
  - [`partial()`](#partial)
  - [`required()`](#required)
- [Literals](#literals)
- [Enums](#enums)
- [Native enums](#native-enums)
- [Arrays](#arrays)
  - [`.element`](#element)
- [Unions](#unions)
- [Tuples](#tuples)
- [Records](#records)
- [Maps](#maps)
- [Sets](#sets)
- [Recursive Objects](#recursive-objects)
  - [Other Recursive Types / JSON](#other-recursive-types--json)
- [Error handling](#error-handling)
  - [`visitErrors()`](#visiterrors)
- [TBD](#tbd)
  - [Fluent interface extension, module augmentation](#fluent-interface-extension-module-augmentation)
  - [Built-in validators](#built-in-validators)
  - [Cyclical objects](#cyclical-objects)
  - [Promises](#promises)
  - [Functions](#functions)
- [Out of scope](#out-of-scope)
  - [Intersections](#intersections)
  - [Built-in validators](#built-in-validators-1)
- [WIP](#wip)
  - [`excludeKind()`](#excludekind)
  - [`flatExcludeKind()`](#flatexcludekind)
  - [Extract / FlatExtract](#extract--flatextract)
  - [Custom Types](#custom-types)
  - [`.brand()`](#brand)

## Introduction

Nimbit is a TypeScript-first schema declaration and validation library just like Zod. However, it is extremely small and strives to keep as much functinality and typing in userland as possible. Furthermore, Nimbit ensures all types are always guaranteed to be reflected upon no matter what.

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
npm install nimbit      # npm
yarn add nimbit          # yarn
pnpm add nimbit          # pnpm
```

## Basic usage

Creating a simple string schema

```ts
import { string } from 'nimbit';

// creating a schema for strings
const mySchema = string;

// parsing
mySchema.parse('tuna'); // => "tuna"
mySchema.parse(12); // => throws error
```

Creating an object schema

```ts
import { obj, string, type Infer } from 'nimbit';

const User = obj({
  username: string
});

User.parse({ username: 'Ludwig' }); // {username: "Ludwig"}}

// Define the inferred TypeScript type
type User = Infer<typeof User>;
// { username: string }
```

## Primitives

```ts
import { any, bigint, boolean, date, never, nul, number, string, symbol, undef, unknown } from 'nimbit';

// primitive values
string;
number;
bigint;
boolean;
date;
symbol;

// empty types
undef;
nul;

// catch-all types
// allows any value
any;
unknown;

// never type
// allows no values
never;
```

## Basic Coercion

First, there are built in helpers for coercing primitive types.

```ts
asString.parse('tuna'); // => "tuna"
asString.parse(12); // => "12"
asString.parse(true); // => "true"
```

```ts
asString; // String(input)
asNumber; // Number(input)
asBoolean; // Boolean(input)
asBigint; // BigInt(input)
asDate; // new Date(input)
```

These coercion data types are full fledged Types equivalent to their output type. In other words, `expect(asString).toEqual(string)` is `true`. The only difference is the behavior of `parse().`

**Boolean coercion**

Boolean coercion is very simple! It passes the value into the `Boolean(value)` function, that's it. Any truthy value will resolve to `true`, any falsy value will resolve to `false`.

```ts
asBoolean.parse('tuna'); // => true
asBoolean.parse('true'); // => true
asBoolean.parse('false'); // => true
asBoolean.parse(1); // => true
asBoolean.parse(0); // => false
asBoolean.parse([]); // => false
asBoolean.parse(undefined); // => false
asBoolean.parse(null); // => false
```

### `where()` for basic validation

Use the `where()` method and returning `true` if the data is valid.

```ts
const myNumber = number.where(x => x > 100);
myNumber.parse(150); // => 150
myNumber.parse(80); // => throws error
```

```ts
const nonEmptyString = string.where(x => x !== '');
nonEmptyString.parse('nice'); // => nice
nonEmptyString.parse(''); // => throws error
```

You can create reusable validators as functions as well:

```ts
const nonEmpty = (x: string) => x !== '' && string != null;

//To make it paramaterizes just wrap it in a function that grabs your params.
const min = (min: number) => (x: number) => x >= min;
const range = (min: number, max: number) => (x: number) => x >= min && x <= max;

const matches = (regex: RegExp) => (x: string) => regex.test(x);
const email = string.where(matches(/^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i));

const formData = obj({
  name: string.where(nonEmpty),
  age: number.where(min(0)),
  quantity: number.where(range(1, 100)),
  mainEmail: email
});

//all of these would fail
formData.parse({
  name: '',
  age: -1,
  quantity: 0,
  mainEmail: 'bob@fcom'
});

```

There are a few overloads to `where()` that let you customize the error message. 

### `to()` for user defined coercion and parsing

Nimbit has the versatile `to()` function for manipulating and transforming data between types in parsing pipelines.

For example, here's how to take a `Date` object and turn it into a string:

```ts
const asIsoString = date.to(string, x => x.toISOString());

asIsoString.parse(new Date('2035-02-25')); // => "2035-02-25T00:00:00.000Z"
asIsoString.parse('2035-02-25'); // => throws
```

Writing your own fully validated coercion is extremely easy. For example, here is a way to implement the `asNumber` coercion:

```ts
const target = unknown.to(number, x => Number(x)).where(x => !isNaN(x));

asNumber.safeParse('12'); // => {success: true, data: 12}
asNumber.safeParse('hi'); // => {success: false, error: {kind: 'condition', actual: 'hi'}}
```

After that you can use `asNumber` any place you would use a `string` and when you reflect on asNumber it will appear identical to `string`.

The above says: "Allow any unknown value, try to convert it to a number, and if it is not `NaN``, parsing is successful. Otherwise, fail"

The first argument is the output type of your coercion. This paradigm is important to keep all types defined by Nimbit to be reflective and maintain strong typing throughout your code.

Also we are calling `safeParse()` in this example. This method is just like parse, but doesn't throw. It returns an object describing the result of the parse.

Moving on, that error message isn't so great though. Let's improve it:

```ts
const target = unknown.to(number, x => Number(x)).where(x => !isNaN(x), 'failed to convert to number');
asNumber.safeParse('hi');
// => {success: false, error: {kind: 'condition', message: 'failed to convert to number', actual: 'hi'}}
```

Let's get crazier and return a full error type::

```ts
const asNumber = unknown
  .to(number, x => Number(x))
  .where(
    x => !isNaN(x),
    x => invalidTypeError('asNumber', x, `failed to convert ${x} to a number.`)
  );
asNumber.safeParse('Hello');
// => {success: false, error: {kind: 'invalid_type', expected: 'asType', actual: 'Hello', message: 'failed to convert Hello to a number', }}
```

Now, since this is going to be used a lot let's just skip the pipelining of `to()` and do it in a single step:

```ts
const asNumber = to(number, (value: unknown) => {
  const result = Number(value);
  return !isNaN(result) ? pass(result) : failInvalidType('asNumber', value);
});
```

You have complete control of what happens when you try to coerce a value and how the error handling will happen. The above also lets you omit `unknown.to()` if you wish. `unknown.to()` as it is implied.

If the coercion succeeds you just need to return `pass(result)`. If the coercion fails, return `fail()`. You can also pass a rich error object to `fail()` to provide a custom error message. There's also a convenience method for describing type conversion failures that show the expected result vs supplied value `failInvaldType('asNumber', value)` See custom error types for fully being able to customize your error messages.

If your coercion throws an error, there is also a convenience overload that lets you return whatever error you wish.

```ts
export const asBigint = to(
  bigint,
  (value: string | number | bigint | boolean) => BigInt(value),
  value => invalidTypeError('asBigint', value)
);
```

You've already seen the chaining above, but you can use `.to()` to do things like restricting input types before passing it to a conversion.

```ts
const stringsThatAreNumbers = string.to(asNumber);

stringsThatAreNumbers.parse('12'); // => 12
stringsThatAreNumbers.parse('hello'); // => throws
stringsThatAreNumbers.parse(150); // => throws since only strings are allowed first
```

As a convenience, you can use `tweak()` which is a shorthand for `to()` when you are not altering the type of the data. It will always pass your result to the `pass` function.

```ts
const prefixedString = string.tweak(x => `_${x}`);

prefixedString.parse('hello'); // => "_hello"
prefixedString.parse(1); // => throws
```

## Objects

```ts
// all properties are required by default
const Dog = obj({
  name: string,
  age: number,
});

// extract the inferred type like this
type Dog = Infer<typeof Dog>;

// equivalent to:
type Dog = {
  name: string;
  age: number;
};
```

### `.shape`

Use `.shape` to access the schemas for a particular key. Allows you to reflect against the type.

```ts
Dog.shape.name; // => string schema
Dog.shape.age; // => number schema
```

### `.k`

Use `.k` to get an autocompletable set of the shape's keys.

```ts
Dog.k; // => {name: "name", age: "age"]}
```

### `.passthrough()`

By default object schemas strip out unrecognized keys during parsing.

```ts
const person = obj({
  name: string
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

By default object schemas strip out unrecognized keys during parsing. You can _disallow_ unknown keys with `.strict()` . If there are any unknown keys in the input, the library will throw an error.

```ts
const person = obj({
  name: string
}).strict();

person.parse({
  name: 'bob dylan',
  extraKey: 61
});
// => throws ZodError
```

### `.strip()`

You can use the `.strip` method to reset an object schema to the default behavior (stripping unrecognized keys).

### `.catchall()`

You can pass a "catchall" schema into an object schema. All unknown keys will be validated against it.

```ts
const person = obj({
  name: string
}).catchall(number);

person.parse({
  name: 'bob dylan',
  validExtraKey: 61 // works fine
});

person.parse({
  name: 'bob dylan',
  validExtraKey: false // fails
});
// => throws error
```

Using `.catchall()` obviates `.passthrough()` , `.strip()` , or `.strict()`. All keys are now considered "known".

## Type methods

All types contain certain methods.

### `.parse()`

`.parse(data: unknown): T`

Given any type, you can call its `.parse` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

> IMPORTANT: The value returned by `.parse` will be almost always be a clone of the object you pass in.

```ts
const stringSchema = string;

stringSchema.parse('fish'); // => returns "fish"
stringSchema.parse(12); // throws error
```

### `.safeParse()`

`.safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ParseError; }`

If you don't want to throw errors when validation fails, use `.safeParse`. This method returns an object containing either the successfully parsed data or a `ParseError` instance containing specific information about the error.

```ts
string.safeParse(12);
// => { success: false; error: invalidTypeError }

string.safeParse('billie');
// => { success: true; data: 'billie' }
```

The result is a _discriminated union_, so you can handle errors very conveniently:

```ts
const result = string.safeParse('billie');
if (!result.success) {
  // handle error then return
  result.error;
} else {
  // do something
  result.data;
}
```

### `.where()`

`.where(condition: (value: T) => boolean, customError?: string | ((value: T) => ParseError | string))`

`where()` lets you provide custom validation logic. You can return a more specific error message by returning a string, or providing a function that returns a string, or a rich `ParseError` object that you can customize.

```ts
const myNumber = number.where(x => x > 100);
myNumber.parse(150); // => 150
myNumber.parse(80); // => throws error
```

Simple error message:

```ts
const nonEmptyString = string.where(x => x !== '', 'string should not be empty);
myNumber.parse('nice'); // => nice
myNumber.parse(''); // => throws error
```

using the value for your error

```ts
const nonEmptyString = string.where(
  x => x !== '',
  value => `string: ${value} should not be empty`
);
myNumber.parse('nice'); // => nice
myNumber.parse(''); // => throws error
```

### `.tweak()`

To transform data after parsing, but not change its type:

```ts
const stringWithWorld = string.tweak(x => x + ' world');

stringWithWorld.parse('hello'); // => "6"
```

### `.default()`

As a convenience, you can provide a default value to be used if the input is `undefined`.

```ts
const stringWithDefault = string.default('tuna');

stringWithDefault.parse(undefined); // => "tuna"
```

Optionally, you can pass a function into `.default` that will be re-executed whenever a default value needs to be generated:

```ts
const numberWithRandomDefault = number.default(Math.random);

numberWithRandomDefault.parse(undefined); // => 0.4413456736055323
numberWithRandomDefault.parse(undefined); // => 0.1871840107401901
numberWithRandomDefault.parse(undefined); // => 0.7223408162401552
```

### `.catch()`

Use `.catch()` to provide a "catch value" to be returned in the event of a parsing error.

```ts
const numberWithCatch = number.catch(42);

numberWithCatch.parse(5); // => 5
numberWithCatch.parse('tuna'); // => 42
```

Optionally, you can pass a function into `.catch` that will be re-executed whenever a default value needs to be generated. The caught error will be passed into this function.

```ts
const numberWithRandomCatch = number.catch(error => Math.random());

numberWithRandomCatch.parse('sup'); // => 0.4413456736055323
numberWithRandomCatch.parse('sup'); // => 0.1871840107401901
numberWithRandomCatch.parse('sup'); // => 0.7223408162401552
```

### `.opt()`

You can make any schema by calling `.opt()` on any type.

```ts
const stringOrUndefined = string.opt();
type A = Infer<typeof stringOrUndefined>; // string | undefined;

const user = obj({
  username: string.opt
});
type C = Infer<typeof user>; // { username?: string | undefined };
```

`opt()` is simply a shorthand for creating a union of a type with the `undef` type and they are exactly equivalent.

```ts
const stringOrUndefined = union(string, undef);
type A = Infer<typeof stringOrUndefined>; // string | undefined;
```

You can remove `undef` and `nul` from an optional / `union` by calling `unwrap()`.

```ts
const optionalString = string.opt();
optionalString.unwrap() === stringSchema; // true
```

NOTE: `unwrap()` is a shallow operation on a `union` as you can have nested unions. You can use `flatExcludeKinds()` if you wish to remove a type from all nested unions.

```ts
const optionalString = string.opt().opt();
optionalString.unwrap() === stringSchema; // false!
optionalString.unwrap().unwrap() === stringSchema; // true!

exclude(optionalString, undef) === stringSchema; // false!
flatExcludeKinds(optionalString, undef) === stringSchema; // true!
```

### `.nullable()`

Similarly, you can create nullable types with `nullable()`. Again, this is a `union` of a type with `nul`

```ts
const nullableString = string.nullable();
nullableString.parse('asdf'); // => "asdf"
nullableString.parse(null); // => null
```

### `.nullish()`

You can create types that are both optional and nullable with `nullish()`. Again, this is a `union` of a type with `nul` and `undef`

```ts
const nullishString = string.nullish();
nullishString.parse('asdf'); // => "asdf"
nullishString.parse(undefined); // => undefined
nullishString.parse(null); // => null
```

### Reflection

#### `.kind`

Use `.kind` to get the broad category of a type. `kind` is always a string literal.

```ts
string.kind; // => 'string'
date.kind; // => 'date'
obj({ property: string }).kind; // => 'object'
array(number).kind; // => 'array'
literal('hello').kind; // => 'literal'
union(string, number).kind; // => 'union'
```

#### `.name` / `withName()`

All types can be named. This is for the users benefit. It does not enforce any typeing whatsoever

```ts
const Dog = obj({
  name: string,
  age: number
}).withName('Dog');

Dog.name; // => 'Dog'
```

## Manipulating Types

### `extend()`

You can add additional fields to an object schema with the `extend` function.

```ts
const DogWithBreed = extend(Dog, {
  breed: string
});
```

You can use `extend` to overwrite fields! Be careful with this power!

### `merge()`

Equivalent to `extend(A, B.shape)`.

```ts
const BaseTeacher = obj({ students: array(string) });
const HasID = obj({ id: string });

const Teacher = BaseTeacher.merge(HasID);
type Teacher = Infer<typeof Teacher>; // => { students: string[], id: string }
```

> If the two schemas share keys, the properties of B overrides the property of A. The returned schema also inherits the "unknownKeys" policy (strip/strict/passthrough) and the catchall schema of B.

### `pick()/omit()`

You may use `pick()` and `omit()` to get a modified version of an `object` schema. Consider this Recipe schema:

```ts
const Recipe = obj({
  id: string,
  name: string,
  ingredients: array(string)
});
```

To only keep certain keys, use `pick()` .

```ts
const JustTheName = pick(Recipe, Recipe.k.name);
type JustTheName = Infer<typeof JustTheName>;
// => { name: string }
```

You could also just pass the property name directly.

```ts
const JustTheName = pick(Recipe, 'name');
```

There's also the `getKeys()` convenience function if you wish to use a property map. The keys of the passed object with be used and everything will be strongly typed.

```ts
const JustTheName = pick(Recipe, ...getKeys({ id: 1, name: 1 }));
```

To remove certain keys, use `omit()` in the same fashion as `pick()`

```ts
const JustRecipeName = required(User, 'id', 'ingredients);
type JustRecipeName = Infer<typeof JustRecipeName>;
// => { name: string }

//alternative ways of omitting properties by name
const JustRecipeName = omit(Recipe, Recipe.k.id, Recipe.k.ingredients);
const JustRecipeName = omit(Recipe, ...getKeys({id: 1, ingredients: 1}));
```

### `partial()`

Just like built-in TypeScript utility type [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype), the `partial` function makes all properties optional.

Starting from this object:

```ts
const User = obj({
  email: string
  username: string,
});
// { email: string; username: string }
```

We can create a partial version:

```ts
const partialUser = partial(User);
// { email?: string | undefined; username?: string | undefined }
```

You can also specify which properties to make optional:

```ts
const optionalEmail = partial(User, User.k.email);

/*
{
  email?: string | undefined;
  username: string
}
*/

//alternative ways of picking propertis to the above
const optionalEmail = partial(User, 'email');
const optionalEmail = partial(User, ...getKeys({email: 1}));
```

### `required()`

Contrary to the `partial` function, the `required` function makes all properties required.

Starting from this object:

```ts
const User = partial(obj({
  email: string
  username: string,
}));
// { email?: string | undefined; username?: string | undefined }
```

We can create a required version:

```ts
const requiredUser = required(User);
// { email: string; username: string }
```

You can also specify which properties to make required:

```ts
const requiredEmail = required(User, User.k.email);
/*
{
  email: string;
  username?: string | undefined;
}
*/

//alternative ways of picking properties by name
const requiredEmail = required(User, 'email');
const requiredEmail = required(User, ...getKeys({email: 1}));
```

## Literals

Literal schemas represent a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), like `"hello world"` or `5`.

```ts
const tuna = literal('tuna');
const twelve = literal(12);

const twobig = literal(2n); // bigint literal
const tru = literal(true);

const terrificSymbol = Symbol('terrific');
const terrific = literal(terrificSymbol);

// retrieve literal value
tuna.value; // "tuna"
```

## Enums

```ts
const FishEnum = enumm(['Salmon', 'Tuna', 'Trout']);
type FishEnum = Infer<typeof FishEnum>;
// 'Salmon' | 'Tuna' | 'Trout'
```

`enumm` is a way to declare a schema with a fixed set of allowable _string_ values. Pass the array of values directly into `enumm()`. Alternatively, use `as const` to define your enum values as a tuple of strings. See the [const assertion docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) for details.

```ts
const VALUES = ['Salmon', 'Tuna', 'Trout'] as const;
const FishEnum = enumm(VALUES);
```

This is not allowed, since TypeScript isn't able to infer the exact values of each element.

```ts
const fish = ['Salmon', 'Tuna', 'Trout'];
const FishEnum = enum(fish);
```

**Autocompletion**

To get autocompletion with an `enumm` type, use the `.enum` property of your schema:

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

You can also retrieve the list of options as a tuple with the `.shape` property:

```ts
FishEnum.options; // ["Salmon", "Tuna", "Trout"];
```

## Native enums

Enums created with `enumm()` are the recommended approach to defining and validating enums. But if you need to validate against an enum from a third-party library (or you don't want to rewrite your existing enums) you can use `nativeEnum()`.

**Numeric enums**

```ts
enum Fruits {
  Apple,
  Banana
}

const FruitEnum = nativeEnum(Fruits);
type FruitEnum = Infer<typeof FruitEnum>; // Fruits

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

const FruitEnum = nativeEnum(Fruits);
type FruitEnum = Infer<typeof FruitEnum>; // Fruits

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

const FruitEnum = nativeEnum(Fruits);
type FruitEnum = Infer<typeof FruitEnum>; // "apple" | "banana" | 3

FruitEnum.parse('apple'); // passes
FruitEnum.parse('banana'); // passes
FruitEnum.parse(3); // passes
FruitEnum.parse('Cantaloupe'); // fails
```

You can access the underlying object with the `.enum` property:

```ts
FruitEnum.enum.Apple; // "apple"
```

## Arrays

```ts
const stringArray = array(string);

string.array.parse(['hi', 'there']); // => ['hi', 'there']
string.array.parse(['hi', 1]); // => fail
```

Use `.element` to access the schema for an element of the array.

```ts
stringArray.element; // => string schema
```

## Unions

The `union()` method is for composing "OR" types. In Nimbit, unions are much richer than other libaries as they support reflection and the

```ts
const stringOrNumber = union(string, number);

stringOrNumber.parse('foo'); // passes
stringOrNumber.parse(14); // passes
```

The library will test the input against each of the "options" in order and return the first value that validates successfully.

**Optional string validation:**

To validate an optional form input, you can union the desired string validation with an empty string [literal](#literals).

This example validates an input that is optional but needs to contain a [valid URL](#strings):

```ts
const isUrl = /*...*/
const optionalUrl = union(string.where(isUrl).nullish(), literal(''));

optionalUrl.parse(undefined).success; // true
optionalUrl.parse(null).success; // true
optionalUrl.parse('').success; // true
optionalUrl.parse('https://github.com').success; // true
optionalUrl.parse('not a valid url').success; // false
```

**Reflecting on a union:**

Unions can be nested, so there is a `.members` property on `union` schemas that returns a strongly typed tuple of the union nesting hiearchy

```ts
const nestedUnions = union(string, union(number, undef));

nestedUnions.members; // => [StringT, [UnionType<..., [NumberT, UndefinedT]>]
nestedUnions.members[1].members; // => [NumberT, UndefinedT]
nestedUnions.members[1].members[0].kind; // => 'number'
```

## Tuples

Unlike arrays, tuples have a fixed number of elements and each element can have a different type.

```ts
const athleteSchema = tuple([
  string, // name
  number, // jersey number
  obj({
    pointsScored: number
  }) // statistics
]);

type Athlete = Infer<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

## Records

Record schemas are used to validate types such as `{ [k: string]: number }`.

If you want to validate the _values_ of an object against some schema but don't care about the keys, use `record(any, valueType)`:

```ts
const NumberCache = record(string, number);

type NumberCache = Infer<typeof NumberCache>;
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

You can validate both the keys and the values

```ts
const NoEmptyKeysSchema = record(
  string.where(x => x.length >= 1),
  number
);
NoEmptyKeysSchema.parse({ count: 1 }); // => { 'count': 1 }
NoEmptyKeysSchema.parse({ '': 1 }); // fails
```

## Maps

```ts
const stringNumberMap = map(string, number);

type StringNumberMap = Infer<typeof stringNumberMap>;
// type StringNumberMap = Map<string, number>
```

## Sets

```ts
const numberSet = set(number);
type NumberSet = Infer<typeof numberSet>;
// type NumberSet = Set<number>
```

## Recursive Objects

One of the biggest advantages of Nimbit is a new approach to recursive types. In Nimbit, recursive types are defined as naturally as typical objects, but instead you first define your object's shape as a class before passing it to `obj()`.

Unlike Zod, the TypeScript type is able to be inferred automatically, and there is no need to use `lazy()`.

```ts
class CategoryDef {
  name = string;
  subcategories = array(obj(CategoryDef));
}
const Category = obj(CategoryDef);
type Category = Infer<typeof Category>;

Category.parse({
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

// after you've defined Category with obj(), you no longer have to refer to the class definition. Magic!
const categoryList = array(Category);
```

Mutually recursive types are also allowed.

```ts
class PersonDef {
  name = string;
  addresses? = array(obj(AddressDef)).opt(); //notice that the class property is marked with '?'
}

class AddressDef {
  resident? = obj(PersonDef).opt();
  street = string;
}

const Person = obj(PersonDef);
type Person = Infer<typeof Person>;

const Address = obj(AddressDef);
type Address = Infer<typeof Address>;

Person.parse({
  name: 'Bob',
  addresses: [
    {
      resident: { name: 'Bob' },
      street: '123 Main St.'
    }
  ]
}); //passes

Address.parse({
  resident: { name: 'Bob' },
  street: '123 Main St.'
}); //passes
```

**Optional properties in class defintions**

One caveat of using classes to define your object shemas is that you must mark the class properties with a `?` like above if you wish it to remain optional in your TypeScript definition. Calling `.opt()` alone won't do the trick. This is because of TypeScript.

### Other Recursive Types / JSON

Unfortunately, recursive unions, and records are not as straightforward. For that you use `lazy()` which lets you use a type as you define it. The only problem is that you must provide the TypeScript types manually.

If you want to validate any JSON value, you can use the snippet below. (It also has a trivial guard against prototype poisoning.)

```ts
import {
  array,
  boolean,
  EVIL_PROTO,
  failInvalidType,
  lazy,
  nul,
  number,
  pass,
  record,
  string,
  to,
  union,
  type Infer,
  type LazyType,
  type ParseResult
} from '.';

const Literals = union(string, number, boolean, nul);
type JsonLiterals = Infer<typeof Literals>;

export type json = JsonLiterals | json[] | { [key: string]: json };

const jsonSchema: LazyType<json> = lazy(() => union(Literals, array(jsonSchema), record(string, jsonSchema)));

export const json = to(jsonSchema, jsonParse);

export function jsonParse(x: string): ParseResult<json> {
  try {
    return pass(JSON.parse(x, (key, value) => (key === EVIL_PROTO ? undefined : value)));
  } catch (err) {
    return failInvalidType('json', x);
  }
}
json.parse('{"a":1}'); //passes and returns { a: 1 }
```

## Error handling

> Note: work in progress.

At the moment, there is a discriminated union called `ParseError` that is returned by `.safeParse()` and `.parse()` when an error occurs.

```ts
const result = obj({
  name: string()
}).safeParse({ name: 12 });

if (!result.success) {
  result.error;
  /* [
      {
        "kind": "invalid_type",
        "expected": "string",
        "actual": 12,              
      }
  ] */
}
```

### `visitErrors()`

The errors are in a hiearchary of `ParseError` objects. You can use `visitErrors` to traverse the errors and format them as you wish.

```ts
const TestObj = t.obj({
  strProp: t.string,
  nested: t.obj({
    nestedA: t.number,
    nestedB: t.string
  })
});

const result = TestObj.safeParse({
  strProp: 1337,
  nested: {
    nestedA: 'wrong',
    nestedB: 7n
  }
});

if (!result.success) {
  for (const [error, path] of visitErrors(result.error)) {
    console.log(error.kind);
    console.log(error.path);
  }
}
```

## TBD

### Fluent interface extension, module augmentation

It may be possible and it is desirable for users to be able to augment the built-in types with their own convenience methods. This could be accomplished via class mix-ins or modifying the prototoypes with TypeScript's module augmentation. This is a big decision as there appear to be nuances with TypeScript module augmentation and globabally modifying a prototype may or may not potentially cause problems with multiple libraries modifying the same types.

### Built-in validators

TBD: There are pros and cons to shipping with built-in validators like `min()`, `nonempty` etc like Zod has. In light of the fact that `where()` handles any possible scenario, and making a reusable validators is as simple as defining simple boolean expressions and making higher order functions.

```ts
const nonEmpty = (x: string) => x !== '' && string != null;
const min = (min: number) => (x: number) => x >= min;
const range = (min: number, max: number) => (x: number) => x >= min && x <= max;
const matches = (regex: RegExp) => (x: string) => regex.test(x);
const email = string.where(matches(/^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i));

const formData = obj({
  name: string.where(nonEmpty),
  age: number.where(min(0)),
  quantity: number.where(range(1, 100)),
  mainEmail: email
});

formData.parse({
  name: '',
  age: -1,
  quantity: 0,
  mainEmail: 'bob@fcom'
});

```

Note that the regex above is not necessarily to spec, which is why not including it in validator libraries is worthy of consideration.

### Cyclical objects

TBD: Add support in parsing

### Promises

TBD whether to support

### Functions

TBD whether to support

## Out of scope

### Intersections

Interesections are not in scope for Nimbit. They have limited use in the real world, and cause immense complications in implementing a type system library. Even though they are present in other libraries like Zod, they end up being somewhat of a dead end as you lose the ability to use pick and omit.

In general, use `merge` and `extend`.

### Built-in validators

Interesections are not in scope for Nimbit. They have limited use in the real world, and cause immense complications in implementing a type system library. Even though they are present in other libraries like Zod, they end up being somewhat of a dead end as you lose the ability to use pick and omit.

In general, use `merge` and `extend`.

## WIP

### `excludeKind()`

Allows you to remove a `kind` of type from a single union. It does not traverse nested unions. This is presently in the library but has a slight chance of changing

### `flatExcludeKind()`

Flattens the hierarchy of nested Unions and then removes a `kind` of type from all the unions. A new union is returned.

### Extract / FlatExtract

### Custom Types

TODO: document `createType()` and deriving from `Typ` after a round of feedback.

One of the "big deals" about Nimbit is how much of type declaration is pushed into userland so that there is maximum flexibility. For example, the library does not ship with the more esoteric JS types like [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays) like `Int8Array`, `Float32Array`, etc. However, you can defined these types yourself through exactly the same mechanism that the library uses to define `string`, `number`, etc. This means that you never need to wait for this library to upgrade to use any types you come across.

Furthermore, this feature is also here in order to lay the groundwork for ORM's to define Database types in a semi-native fashion. Note: This is considered unstable until this exact scenario is tested.

### `.brand()`

TBD
