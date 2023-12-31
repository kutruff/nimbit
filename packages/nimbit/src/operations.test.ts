/* eslint-disable @typescript-eslint/no-unused-vars */
import ts from 'typescript';

import * as t from '.';
import {
  asBoolean,
  asNumber,
  asString,
  boolean,
  enumm,
  getKeys,
  mapProps,
  number,
  obj,
  string,
  type ParseResult
} from '.';
import { expectType, expectTypesSupportAssignment, type TypeEqual, type TypeOf } from './test/utilities';

describe('Type operations', () => {
  describe('extend()', () => {
    it('overrides distinct properties', () => {
      const objA = t.obj({ propA: t.string });
      const shapeB = { propB: t.number };
      const Result = objA.extend(shapeB);
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
      const Result = objA.extend(shapeB);
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
      const Result = objA.merge(objB);
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
      const Result = objA.merge(objB);
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

    it('supports many types without TypeScript dying', () => {
      const A = t.obj({ prop: t.number, propA: t.string });
      const B = t.obj({ prop: t.number, propB: t.string, a: A });
      const C = t.obj({ prop: t.number, propC: t.string, b: B });
      const D = t.obj({ prop: t.number, propD: t.string, c: C });
      const E = t.obj({ prop: t.number, propE: t.string, d: D });
      const F = t.obj({ prop: t.number, propF: t.string, e: E });
      const G = t.obj({ prop: t.number, propG: t.string, f: F });
      const H = t.obj({ prop: t.number, propH: t.string, g: G });
      const I = t.obj({ prop: t.number, propI: t.string, h: H });

      const AB = A.merge(B);
      const ABC = AB.merge(C);
      const ABCD = ABC.merge(D);
      const ABCDE = ABCD.merge(E);
      const ABCDEF = ABCDE.merge(F);
      const ABCDEFG = ABCDEF.merge(G);
      const ABCDEFGH = ABCDEFG.merge(H);
      const ABCDEFGHI = ABCDEFGH.merge(I);

      type AB = t.Infer<typeof A>;
      type ABC = t.Infer<typeof AB>;
      type ABCD = t.Infer<typeof ABCD>;
      type ABCDE = t.Infer<typeof ABCDE>;
      type ABCDEF = t.Infer<typeof ABCDEF>;
      type ABCDEFG = t.Infer<typeof ABCDEFG>;
      type ABCDEFGH = t.Infer<typeof ABCDEFGH>;
      type ABCDEFGHI = t.Infer<typeof ABCDEFGHI>;

      const ABCDEFGH_ABCDEFGHI = ABCDEFGH.merge(ABCDEFGHI);
      type ABCDEFGH_ABCDEFGHI = t.Infer<typeof ABCDEFGH_ABCDEFGHI>;
      const result: ABCDEFGH_ABCDEFGHI = {} as unknown as ABCDEFGH_ABCDEFGHI;

      class RecADef {
        recB? = t.obj(RecBDef).opt();
        strProp = t.string;
      }

      class RecBDef {
        recA = t.obj(RecADef);
        a2 = t.flatExcludeKinds(
          t.flattenUnion(t.union(t.obj(RecADef), t.union(t.obj(RecBDef), t.undef), t.string)),
          t.string
        );
      }
      const RecA = t.obj(RecADef);
      type RecA = t.Infer<typeof RecA>;

      expect(RecA.shape.recB.kind).toEqual('union');

      const RecB = t.obj(RecBDef);
      type RecB = t.Infer<typeof RecB>;

      const RecA_ABCDEFGH_ABCDEFGHI = RecA.merge(ABCDEFGHI);
      type RecA_ABCDEFGH_ABCDEFGHI = t.Infer<typeof RecA_ABCDEFGH_ABCDEFGHI>;

      expect(RecA_ABCDEFGH_ABCDEFGHI.shape.recB.kind).toEqual('union');
      expect(RecA_ABCDEFGH_ABCDEFGHI.shape.recB.members[0].shape.a2.members[0].shape.recB.kind).toEqual('union');
      expect(
        RecA_ABCDEFGH_ABCDEFGHI.shape.h.shape.g.shape.f.shape.e.shape.d.shape.c.shape.b.shape.a.shape.prop
      ).toEqual(t.number);
    });
  });

  describe('partial()', () => {
    it('makes required properites into optionals', () => {
      const target = t.obj({ prop: t.string, prop3: t.record(t.string, t.number) });
      const Result = target.partial();
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
      const Result = target.partial(...getKeys({ prop0: 1, prop1: 1, prop3: 1 }));
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
      const Result = target.partial();
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
      const result = target.required();
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
      const result = target.required(...getKeys({ prop3: 1 }));
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
      const result = target.required();
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
      const result = target.pick('prop0');
      const resultadf = target.pick(...getKeys({ prop0: true, prop1: 1 }));
      type ResultTsType = t.Infer<typeof result>;
      expect(result.shape.prop0).toEqual(t.string);
      expect(result.shape).not.toHaveProperty('prop1');
    });

    it('selects correct properties with getKeys', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const result = target.pick(...getKeys({ prop1: 1 }));
      type ResultTsType = t.Infer<typeof result>;
      expect(result.shape.prop1).toEqual(t.bigint);
      expect(result.shape).not.toHaveProperty('prop0');
    });
  });

  describe('omit()', () => {
    it('removes correct properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const Result = target.omit('prop0');
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, { prop1: bigint }>>(true);

      expect(Result.shape.prop1).toEqual(t.bigint);
      expect(Result.shape).not.toHaveProperty('prop0');
    });
  });

  describe('flatExclude()', () => {
    it.todo('check for literals and strings in both directions');
    it.todo('check objects ');

    it('does not exclude single type outside set', () => {
      const Result = t.flatExcludeKinds(t.string, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('does not exclude unions when out of set', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);

      const Result = t.flatExcludeKinds(target, t.literal('foo'));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<typeof Result, typeof target>>(true);

      expect(Result).toEqual(target);
    });

    it('excludes subset of union', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const Result = t.flatExcludeKinds(target, t.string);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, bigint | number>>(true);
      const expected = t.union(t.number, t.bigint);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('excludes unions of unions works', () => {
      const target = t.union(t.union(t.boolean, t.string, t.number, t.date));
      const flattened = t.flattenUnion(target);
      const Result = t.flatExcludeKinds(target, t.union(t.string, t.bigint, t.boolean));
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
      const Result = t.flatExcludeKinds(target, t.union(t.number, t.string, t.bigint, t.boolean));
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
        a2 = t.flatExcludeKinds(
          t.flattenUnion(t.union(t.obj(ADef), t.union(t.obj(BDef), t.undef), t.string)),
          t.string
        );
      }

      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;

      const B = t.obj(BDef);
      type B = t.Infer<typeof B>;

      expect(A.shape.b.members[0]).toEqual(B);
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
      const Result = t.excludeKinds(t.string, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('excludes based on kind only', () => {
      const Result = t.excludeKinds(t.union(t.string, t.obj({ prop: t.number })), t.obj({ random: t.bigint }));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('keeps repeated types as union', () => {
      const Result = t.excludeKinds(t.union(t.string, t.string, t.bigint), t.bigint);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.union(t.string, t.string);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('is shallow for unions of unions', () => {
      const target = t.union(t.number, t.union(t.boolean, t.number));

      const Result = t.excludeKinds(target, t.union(t.number, t.bigint, t.boolean));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, boolean | number>>(true);
      const expected = t.union(t.boolean, t.number);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('returns never when nothing is left', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      // const Result = t.exclude(target, t.union(t.number, t.string, t.bigint, t.boolean));
      const Result = t.excludeKinds(target, t.number, t.string, t.bigint, t.boolean);
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
        a2 = t.excludeKinds(t.excludeKinds(t.union(t.obj(ADef), t.union(t.obj(BDef), t.undef), t.string)), t.string);
      }

      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;

      const B = t.obj(BDef);
      type B = t.Infer<typeof B>;

      expect(A.shape.b.members[0]).toEqual(B);
      expect(B.shape.a).toEqual(A);

      type ExpectedAShape = { b?: B; strProp: string };
      expectTypesSupportAssignment<ExpectedAShape, A>();
      expectTypesSupportAssignment<A, ExpectedAShape>();

      type ExpectedBShape = { a: A; a2: A | B | undefined };
      expectTypesSupportAssignment<ExpectedBShape, B>();
      expectTypesSupportAssignment<B, ExpectedBShape>();
    });
  });

  // describe('extract()', () => {
  //   it.todo('check for literals and strings in both directions');

  //   it('extracts single types', () => {
  //     const Result = t.extract(t.string, t.bigint, t.string);
  //     type Result = t.Infer<typeof Result>;

  //     expectType<TypeEqual<Result, string>>(true);
  //     const expected = t.string;
  //     expectType<TypeEqual<typeof Result, typeof expected>>(true);
  //     expect(Result).toEqual(expected);
  //   });

  //   it('extracting from outside the set returns empty', () => {
  //     const target = t.union(t.number, t.string, t.bigint, t.boolean);
  //     const result = t.extract(target, t.literal('foo'));

  //     expect(result.kind).toEqual('never');
  //   });

  //   it('is shallow for unions of unions', () => {
  //     const target = t.union(t.boolean, t.union(t.boolean, t.number));

  //     const Result = t.extract(target, t.union(t.number, t.bigint, t.boolean));

  //     const toExtract = t.union(t.number, t.bigint, t.boolean);
  //     type Result = t.Infer<typeof Result>;

  //     expectType<TypeEqual<Result, boolean>>(true);
  //     const expected = t.boolean;
  //     expectType<TypeEqual<typeof Result, typeof expected>>(true);
  //     expect(Result).toEqual(expected);
  //   });

  //   it('returns types from union in extraction set', () => {
  //     const target = t.union(t.string, t.number, t.bigint);

  //     const Result = t.extract(target, t.bigint, t.number);
  //     type Result = t.Infer<typeof Result>;

  //     expectType<TypeEqual<Result, bigint | number>>(true);
  //     const expected = t.union(t.number, t.bigint);
  //     // expectType<TypeEqual<typeof Result, typeof expected>>(true);
  //     expect(Result).toEqual(expected);
  //   });

  //   it('extracting only single value returns the value not a union', () => {
  //     const target = t.union(t.number, t.string, t.bigint, t.boolean);
  //     const result = t.extract(target, t.string);

  //     expect(result).toEqual(t.string);
  //     expect(result.members).toEqual([]);
  //   });
  // });

  // describe('flatExtract()', () => {
  //   it.todo('check for literals and strings in both directions');

  //   it('extracts single types', () => {
  //     const Result = t.flatExtract(t.string, t.bigint, t.string);
  //     type Result = t.Infer<typeof Result>;

  //     expectType<TypeEqual<Result, string>>(true);
  //     const expected = t.string;
  //     expectType<TypeEqual<typeof Result, typeof expected>>(true);
  //     expect(Result).toEqual(expected);
  //   });

  //   it('extracting from outside the set returns empty', () => {
  //     const target = t.union(t.number, t.string, t.bigint, t.boolean);
  //     const result = t.flatExtract(target, t.literal('foo'));

  //     expect(result.kind).toEqual('never');
  //     expect(result.members).toEqual([]);
  //   });

  //   it('returns types from union in extraction set', () => {
  //     const target = t.union(t.string, t.number, t.bigint);

  //     const Result = t.flatExtract(target, t.bigint, t.number);
  //     type Result = t.Infer<typeof Result>;

  //     expectType<TypeEqual<Result, bigint | number>>(true);
  //     const expected = t.union(t.number, t.bigint);
  //     // expectType<TypeEqual<typeof Result, typeof expected>>(true);
  //     expect(Result).toEqual(expected);
  //   });

  //   it('extracting unions of unions works', () => {
  //     const target = t.union(t.union(t.boolean, t.string));
  //     const Result = t.flatExtract(target, t.union(t.string, t.bigint, t.boolean));

  //     type Result = t.Infer<typeof Result>;
  //     expectType<TypeEqual<Result, string | boolean>>(true);
  //     const expected = t.union(t.boolean, t.string);
  //     // expectType<TypeEqual<typeof Result, typeof expected>>(true);
  //     expect(Result).toEqual(expected);
  //   });

  //   it('extracting only single value returns the value not a union', () => {
  //     const target = t.union(t.number, t.string, t.bigint, t.boolean);
  //     const result = t.flatExtract(target, t.string);

  //     expect(result).toEqual(t.string);
  //     expect(result.members).toEqual([]);
  //   });
  // });
});
