/* eslint-disable @typescript-eslint/no-unused-vars */
import ts from 'typescript';

import * as t from '.';
import { getKeys, type ParseResult } from '.';
import { expectType, expectTypesSupportAssignment, type TypeEqual, type TypeOf } from './test/utilities';

describe('Type operations', () => {
  describe('extend()', () => {
    it('overrides distinct properties', () => {
      const objA = t.obj({ propA: t.string });
      const shapeB = { propB: t.number };
      const Result = t.extend(objA, shapeB);
      type Result = t.Infer<typeof Result>;
      type ResultT = t.Resolve<typeof Result>;
      const ExpectedDefinitionType = t.obj({
        propA: t.string,
        propB: t.number
      });
      type ExpectedDefinitionType = typeof ExpectedDefinitionType;

      //TODO: The type check fails without having Extend<> have a Resolve around it...
      expectType<TypeEqual<typeof Result, ExpectedDefinitionType>>(true);

      type ExpectedResult = { propA: string; propB: number };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedDefinitionType);
    });

    it('overrides conflicting properties from B over A', () => {
      const objA = t.obj({ prop: t.number, propA: t.string });
      const shapeB = { prop: t.string, propB: t.number };
      const Result = t.extend(objA, shapeB);
      type Result = t.Infer<typeof Result>;

      const ExpectedDefinitionType = t.obj({
        propA: t.string,
        propB: t.number,
        prop: t.string
      });

      type ExpectedDefinitionType = typeof ExpectedDefinitionType;
      expectType<TypeEqual<typeof Result, ExpectedDefinitionType>>(true);

      type ExpectedResult = { propA: string; propB: number; prop: string };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedDefinitionType);
    });
  });

  describe('merge()', () => {
    it('overrides distinct properties', () => {
      const objA = t.obj({ propA: t.string });
      const objB = t.obj({ propB: t.number });
      const Result = t.merge(objA, objB);
      type Result = t.Infer<typeof Result>;
      type ResultT = t.Resolve<typeof Result>;
      const ExpectedDefinitionType = t.obj({
        propA: t.string,
        propB: t.number
      });
      type ExpectedDefinitionType = typeof ExpectedDefinitionType;

      //TODO: The type check fails without having Extend<> have a Resolve around it...
      expectType<TypeEqual<typeof Result, ExpectedDefinitionType>>(true);

      type ExpectedResult = { propA: string; propB: number };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedDefinitionType);
    });

    it('overrides conflicting properties from B over A', () => {
      const objA = t.obj({ prop: t.number, propA: t.string });
      const objB = t.obj({ prop: t.string, propB: t.number });
      const Result = t.merge(objA, objB);
      type Result = t.Infer<typeof Result>;

      const ExpectedDefinitionType = t.obj({
        propA: t.string,
        propB: t.number,
        prop: t.string
      });

      type ExpectedDefinitionType = typeof ExpectedDefinitionType;
      expectType<TypeEqual<typeof Result, ExpectedDefinitionType>>(true);

      type ExpectedResult = { propA: string; propB: number; prop: string };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedDefinitionType);
    });
  });

  describe('partial()', () => {
    it('makes required properites into optionals', () => {
      const target = t.obj({ prop: t.string, prop3: t.record(t.string, t.number) });
      const Result = t.partial(target);
      type Result = t.Infer<typeof Result>;

      const ExpectedDefinition = t.obj({ prop: t.string.opt(), prop3: t.union(t.record(t.string, t.number), t.undef) });
      type ExpectedDefinition = t.Infer<typeof ExpectedDefinition>;

      expectType<TypeEqual<typeof Result, typeof ExpectedDefinition>>(true);

      expectTypesSupportAssignment<typeof ExpectedDefinition, typeof Result>();
      expectTypesSupportAssignment<typeof Result, typeof ExpectedDefinition>();

      type ExpectedResult = { prop?: string; prop3?: Record<string, number> };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedDefinition);
    });

    it('allows me to pick subset of properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.number, prop2: t.bigint, prop3: t.record(t.string, t.number) });
      const Result = t.partial(target, ...getKeys({ prop0: 1, prop1: 1, prop3: 1 }));
      type Result = t.Infer<typeof Result>;

      const ExpectedDefinition = t.obj({
        prop0: t.string.opt(),
        prop1: t.number.opt(),
        prop3: t.union(t.record(t.string, t.number), t.undef),
        prop2: t.bigint
      });
      type ExpectedDefinition = t.Infer<typeof ExpectedDefinition>;

      expectType<TypeEqual<typeof Result, typeof ExpectedDefinition>>(true);

      expectTypesSupportAssignment<typeof ExpectedDefinition, typeof Result>();
      expectTypesSupportAssignment<typeof Result, typeof ExpectedDefinition>();

      type ExpectedResult = { prop0?: string; prop1?: number; prop2: bigint; prop3?: Record<string, number> };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedDefinition);
    });

    it('is shallow', () => {
      const nestedObj = t.obj({ prop: t.bigint });
      const target = t.obj({ prop: t.string, nested: nestedObj });
      const Result = t.partial(target);
      type Result = t.Infer<typeof Result>;

      const ExpectedResult = t.obj({
        prop: t.string.opt(),
        nested: t
          .obj({
            prop: t.bigint
          })
          .opt()
      });

      expectType<TypeEqual<typeof Result, typeof ExpectedResult>>(true);

      type ExpectedResult = { prop?: string; nested?: { prop: bigint } };
      expectType<TypeEqual<Result, ExpectedResult>>(true);

      expect(Result).toEqual(ExpectedResult);
    });
  });

  describe('required()', () => {
    it('makes optional properites into required properties', () => {
      const target = t.obj({ optProp: t.string.opt(), normalProp: t.number });
      const result = t.required(target);
      type result = t.Resolve<typeof result>;
      type Result = t.Infer<typeof result>;

      const ExpectedResult = t.obj({ optProp: t.string, normalProp: t.number });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ExpectedResultTsType = { optProp: string; normalProp: number };
      expectTypesSupportAssignment<ExpectedResultTsType, Result>();
      expectTypesSupportAssignment<Result, ExpectedResultTsType>();

      expect(result).toEqual(ExpectedResult);
    });

    it('allows me to pick a subset of properites into required properties', () => {
      const target = t.obj({ prop0: t.string.opt(), prop1: t.number, prop3: t.bigint.opt() });
      const result = t.required(target, ...getKeys({ prop3: 1 }));
      type result = t.Resolve<typeof result>;
      type Result = t.Infer<typeof result>;

      const ExpectedResult = t.obj({ prop0: t.string.opt(), prop1: t.number, prop3: t.bigint });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ExpectedResultTsType = { prop0?: string; prop1: number; prop3: bigint };
      expectTypesSupportAssignment<ExpectedResultTsType, Result>();
      expectTypesSupportAssignment<Result, ExpectedResultTsType>();

      expect(result).toEqual(ExpectedResult);
    });

    it('is shallow', () => {
      const nestedObj = t.obj({ prop: t.bigint.opt() });
      const target = t.obj({ prop: t.string.opt(), nested: nestedObj.opt() });
      const result = t.required(target);
      type Result = t.Infer<typeof result>;

      const ExpectedResult = t.obj({
        prop: t.string,
        nested: t.obj({
          prop: t.bigint.opt()
        })
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultTsType = t.Infer<typeof result>;
      type ExpectedResultTsType = { prop: string; nested: { prop?: bigint } };
      expectTypesSupportAssignment<ExpectedResultTsType, ResultTsType>();
      expectTypesSupportAssignment<ResultTsType, ExpectedResultTsType>();

      expect(result).toEqual(ExpectedResult);
    });
  });

  // describe('readonly()', () => {
  //   it('makes writable properites into readonly', () => {
  //     const target = t.obj({ prop: t.string });
  //     const result = t.readonly(target);

  //     const ExpectedResult = t.obj({ prop: t.ro(t.string) });
  //     type ExpectedDefinitionType = typeof ExpectedResult;
  //     expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
  //     expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

  //     type ResultShape = t.Infer<typeof result>;
  //     type ExpectedResultShape = { readonly prop: string };
  //     expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
  //     expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

  //     expect(result).toEqual(ExpectedResult);
  //   });

  //   it('is shallow', () => {
  //     const nestedObj = t.obj({ prop: t.bigint });
  //     const target = t.obj({ prop: t.string, nested: nestedObj });
  //     const result = t.readonly(target);

  //     const ExpectedResult = t.obj({
  //       prop: t.ro(t.string),
  //       nested: t.ro(
  //         t.obj({
  //           prop: t.bigint
  //         })
  //       )
  //     });

  //     type ExpectedDefinitionType = typeof ExpectedResult;
  //     expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
  //     expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

  //     type ResultShape = t.Infer<typeof result>;
  //     type ExpectedResultShape = { readonly prop: string; readonly nested: { prop: bigint } };
  //     expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
  //     expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

  //     expect(result).toEqual(ExpectedResult);
  //   });
  // });

  describe('pick()', () => {
    it('selects correct properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const result = t.pick(target, 'prop0');
      const resultadf = t.pick(target, ...getKeys({ prop0: true, prop1: 1 }));
      type ResultTsType = t.Infer<typeof result>;
      expect(t.areEqual(result.shape.prop0, t.string)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop1');
    });

    it('selects correct properties with getKeys', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const result = t.pick(target, ...getKeys({ prop1: 1 }));
      type ResultTsType = t.Infer<typeof result>;
      expect(t.areEqual(result.shape.prop1, t.bigint)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop0');
    });
  });

  describe('omit()', () => {
    it('removes correct properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const Result = t.omit(target, 'prop0');
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, { prop1: bigint }>>(true);

      expect(t.areEqual(Result.shape.prop1, t.bigint)).toEqual(true);
      expect(Result.shape).not.toHaveProperty('prop0');
    });
  });

  describe('flatExclude()', () => {
    it.todo('check for literals and strings in both directions');
    it.todo('check objects ');

    it('does not exclude single type outside set', () => {
      const Result = t.flatExclude(t.string, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('does not exclude unions when out of set', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);

      const Result = t.flatExclude(target, t.literal('foo'));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<typeof Result, typeof target>>(true);

      expect(Result).toEqual(target);
    });

    it('excludes subset of union', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const Result = t.flatExclude(target, t.string);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, bigint | number>>(true);
      const expected = t.union(t.number, t.bigint);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('excludes unions of unions works', () => {
      const target = t.union(t.union(t.boolean, t.string, t.number, t.date));
      const flattened = t.flattenUnion(target);
      const Result = t.flatExclude(target, t.union(t.string, t.bigint, t.boolean));
      // const Result = t.exclude(target, ...t.flattenUnion(t.union(t.string, t.bigint, t.boolean)).members);
      // const Result = t.exclude(flattened, ...t.flattenUnion(t.union(t.string, t.bigint, t.boolean)).members);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, number | Date>>(true);
      const expected = t.union(t.number, t.date);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('returns never when nothing is left', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      const Result = t.flatExclude(target, t.union(t.number, t.string, t.bigint, t.boolean));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, never>>(true);
      expectType<TypeEqual<typeof Result, typeof t.never>>(true);
      expect(Result).toEqual(t.never);
    });

    it('allows mutual recursion', () => {
      class ADef {
        b? = t.obj(BDef).opt();
        strProp = t.string;
      }

      class BDef {
        a = t.obj(ADef);
        a2 = t.flatExclude(t.flattenUnion(t.union(t.obj(ADef), t.union(t.obj(BDef), t.undef), t.string)), t.string);
      }

      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;

      const B = t.obj(BDef);
      type B = t.Infer<typeof B>;

      expect(A.shape.b.unionTypes[0]).toEqual(B);
      expect(B.shape.a).toEqual(A);

      type ExpectedAShape = { b?: B; strProp: string };
      expectTypesSupportAssignment<ExpectedAShape, A>();
      expectTypesSupportAssignment<A, ExpectedAShape>();

      type ExpectedBShape = { a: A; a2: A | B | undefined };
      expectTypesSupportAssignment<ExpectedBShape, B>();
      expectTypesSupportAssignment<B, ExpectedBShape>();
    });
  });

  describe('exclude()', () => {
    it('does not exclude single type outside set', () => {
      const Result = t.exclude(t.string, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('keeps repeated types as union', () => {
      const Result = t.exclude(t.union(t.string, t.string, t.bigint), t.bigint);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.union(t.string, t.string);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('is shallow for unions of unions', () => {
      const target = t.union(t.number, t.union(t.boolean, t.number));

      const Result = t.exclude(target, t.union(t.number, t.bigint, t.boolean));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, boolean | number>>(true);
      const expected = t.union(t.boolean, t.number);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('returns never when nothing is left', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      // const Result = t.exclude(target, t.union(t.number, t.string, t.bigint, t.boolean));
      const Result = t.exclude(target, t.number, t.string, t.bigint, t.boolean);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, never>>(true);
      expectType<TypeEqual<typeof Result, typeof t.never>>(true);
      expect(Result).toEqual(t.never);
    });

    it('allows mutual recursion', () => {
      class ADef {
        b? = t.obj(BDef).opt();
        strProp = t.string;
      }

      class BDef {
        a = t.obj(ADef);
        a2 = t.exclude(t.exclude(t.union(t.obj(ADef), t.union(t.obj(BDef), t.undef), t.string)), t.string);
      }

      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;

      const B = t.obj(BDef);
      type B = t.Infer<typeof B>;

      expect(A.shape.b.unionTypes[0]).toEqual(B);
      expect(B.shape.a).toEqual(A);

      type ExpectedAShape = { b?: B; strProp: string };
      expectTypesSupportAssignment<ExpectedAShape, A>();
      expectTypesSupportAssignment<A, ExpectedAShape>();

      type ExpectedBShape = { a: A; a2: A | B | undefined };
      expectTypesSupportAssignment<ExpectedBShape, B>();
      expectTypesSupportAssignment<B, ExpectedBShape>();
    });
  });

  describe('extract()', () => {
    it.todo('check for literals and strings in both directions');

    it('extracts single types', () => {
      const Result = t.extract(t.string, t.bigint, t.string);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('extracting from outside the set returns empty', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      const result = t.extract(target, t.literal('foo'));

      expect(result.kind).toEqual('never');
      expect(result.unionTypes).toEqual([]);
    });

    it('is shallow for unions of unions', () => {
      const target = t.union(t.boolean, t.union(t.boolean, t.number));

      const Result = t.extract(target, t.union(t.number, t.bigint, t.boolean));

      const toExtract = t.union(t.number, t.bigint, t.boolean);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, boolean>>(true);
      const expected = t.boolean;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('returns types from union in extraction set', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const Result = t.extract(target, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, bigint | number>>(true);
      const expected = t.union(t.number, t.bigint);
      // expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('extracting only single value returns the value not a union', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      const result = t.extract(target, t.string);

      expect(result).toEqual(t.string);
      expect(result.unionTypes).toEqual([]);
    });
  });

  describe('flatExtract()', () => {
    it.todo('check for literals and strings in both directions');

    it('extracts single types', () => {
      const Result = t.flatExtract(t.string, t.bigint, t.string);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('extracting from outside the set returns empty', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      const result = t.flatExtract(target, t.literal('foo'));

      expect(result.kind).toEqual('never');
      expect(result.unionTypes).toEqual([]);
    });

    it('returns types from union in extraction set', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const Result = t.flatExtract(target, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, bigint | number>>(true);
      const expected = t.union(t.number, t.bigint);
      // expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('extracting unions of unions works', () => {
      const target = t.union(t.union(t.boolean, t.string));
      const Result = t.flatExtract(target, t.union(t.string, t.bigint, t.boolean));

      type Result = t.Infer<typeof Result>;
      expectType<TypeEqual<Result, string | boolean>>(true);
      const expected = t.union(t.boolean, t.string);
      // expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('extracting only single value returns the value not a union', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      const result = t.flatExtract(target, t.string);

      expect(result).toEqual(t.string);
      expect(result.unionTypes).toEqual([]);
    });
  });
});
