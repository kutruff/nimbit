/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Type operations', () => {
  describe('intersection()', () => {
    it('objects with distinct properties are merged', () => {
      const objA = t.obj({ propA: t.string });
      const objB = t.obj({ propB: t.number });
      const result = t.intersection(objA, objB);
      type result = t.Resolve<typeof result>;
      const ExpectedDefinitionType = t.obj({
        propA: t.string,
        propB: t.number
      });

      type ExpectedDefinitionType = typeof ExpectedDefinitionType;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof result>;
      type ExpectedResultShape = { propA: string; propB: number };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedDefinitionType);
    });

    describe('object properties with same name and AnyType', () => {
      it('does not result in the correct TypeScript types on purpose do to perf concerns and its a rare things to do.', () => {
        interface A {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          prop: any;
        }
        interface B {
          prop: number;
        }
        type Merged = A & B;

        //Shows what TS normally does - it narrows
        const foo: Merged = { prop: 1 };
        expect(foo.prop).toEqual(1);

        type res = Merged['prop'];
        const objA = t.obj({ prop: t.any });
        const objB = t.obj({ prop: t.number });
        const resultAB = t.intersection(objA, objB);
        expect(resultAB.shape.prop).toEqual(objB.shape.prop);

        const resultBA = t.intersection(objA, objB);
        expect(resultBA.shape.prop).toEqual(objB.shape.prop);
      });
    });

    describe('object properties with same name', () => {
      it('merges properties with three objects used', () => {
        interface D {
          prop0: boolean;
        }
        interface E {
          prop0: boolean;
        }
        interface F {
          prop0: boolean;
          distinctProp: number;
        }

        interface A {
          x: D;
        }
        interface B {
          x: E;
        }
        interface C {
          x: F;
        }

        type ABC = A & B & C;

        const abc: ABC = {
          x: {
            distinctProp: 1,
            prop0: true
          }
        };

        const ObjD = t.obj({ prop0: t.boolean });
        const ObjE = t.obj({ prop0: t.boolean });
        const ObjF = t.obj({ prop0: t.boolean, distinctProp: t.number });
        const ObjA = t.obj({ x: ObjD });
        const ObjB = t.obj({ x: ObjE });
        const ObjC = t.obj({ x: ObjF });

        const ObjABC = t.intersection(t.intersection(ObjA, ObjB), ObjC);
        type ObjABC = t.Infer<typeof ObjABC>;
        const resultInstance: ObjABC = { x: { prop0: true, distinctProp: 1 } };

        expect(ObjABC).toEqual(
          t.obj({
            x: t.obj({
              prop0: t.boolean,
              distinctProp: t.number
            })
          })
        );
      });

      it('merges properties two levels deep', () => {
        interface C {
          prop0: boolean;
        }
        interface D {
          prop0: boolean;
          distinctProp: string;
        }

        interface A {
          x: C;
        }
        interface B {
          x: D;
        }

        type AB = A & B;

        const ab: AB = { x: { prop0: true, distinctProp: 'hi' } };

        type CD = C & D;

        const cd: CD = { prop0: false, distinctProp: 'it compiles' };

        //We set them as matching here. Hard to test prop0 set to t.num because it breaks the compilation which is intended
        const ObjC = t.obj({ prop0: t.boolean });
        const ObjD = t.obj({ prop0: t.boolean, distinctProp: t.string });

        const ObjA = t.obj({ x: ObjC });
        const ObjB = t.obj({ x: ObjD });

        const ObjAB = t.intersection(ObjA, ObjB);
        type ObjAB = t.Infer<typeof ObjAB>;

        const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

        const ObjCD = t.intersection(ObjC, ObjD);
        type ObjCD = t.Infer<typeof ObjCD>;
        const resultInstanceCD: ObjCD = { prop0: true, distinctProp: 'what' };

        type ObjCDIntersect = t.ObjIntersection<typeof ObjC, typeof ObjD>;

        const instanceTestObjCDIntersect: ObjCDIntersect = t.obj({
          prop0: t.boolean,
          distinctProp: t.string
        });

        type ObjCDTsIntersect = t.Infer<typeof ObjC> & t.Infer<typeof ObjD>;

        const instanceTestObjCD: ObjCDTsIntersect = {
          prop0: true,
          distinctProp: 'what'
        };

        expect(ObjAB).toEqual(
          t.obj({
            x: t.obj({
              prop0: t.boolean,
              distinctProp: t.string
            })
          })
        );
      });

      it('does not merge properties that are in conflict', () => {
        interface C {
          prop0: boolean;
        }
        interface D {
          prop0: number;
          distinctProp: string;
        }

        interface A {
          x: C;
        }
        interface B {
          x: D;
        }

        type AB = A & B;

        //can't even do this because of conflicting types. x turns to never, yet compiler says x is required when set to empty object.
        //const ab: AB = {};

        type CD = C & D;
        // this also resolves to never
        //const cd : CD = {};

        //We set them as matching here. Hard to test prop0 set to t.num because it breaks the compilation which is intended
        const ObjC = t.obj({ prop0: t.boolean });
        const ObjD = t.obj({ prop0: t.number, distinctProp: t.string });

        const ObjA = t.obj({ x: ObjC });
        const ObjB = t.obj({ x: ObjD });

        const ObjAB = t.intersection(ObjA, ObjB);
        type ObjAB = t.Infer<typeof ObjAB>;

        //Should not compile:
        //const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

        expect(ObjAB).toEqual(
          t.obj({
            x: t.never
          })
        );
      });
    });

    describe('TypeScript behavior', () => {
      it('recursively merges distinct types', () => {
        interface G {
          d: boolean;
        }
        interface H {
          e: string;
        }
        interface I {
          f: number;
        }

        interface D {
          y: G;
        }
        interface E {
          y: H;
        }
        interface F {
          y: I;
        }

        interface A {
          x: D;
        }
        interface B {
          x: E;
        }
        interface C {
          x: F;
        }

        type ABC = A & B & C;

        const abc: ABC = {
          x: {
            y: { d: true, e: 'what', f: 1 }
          }
        };

        expect(abc.x.y.e).toEqual('what');
      });

      it('sets conflicting types to never', () => {
        interface D {
          conflictingProp: boolean;
        }
        interface E {
          conflictingProp: boolean;
        }
        interface F {
          conflictingProp: number;
          distinctProp: number;
        }

        interface A {
          x: D;
        }
        interface B {
          x: E;
        }
        interface C {
          x: F;
        }

        type ABC = A & B & C;

        type FOO = ABC['x']['conflictingProp'];
        //The following won't compile
        // const abc: ABC = {
        //     x: {
        //         conflictingProp: true,
        //         distinctProp: 1,
        //     }
        // };
      });
    });
  });

  describe('partial()', () => {
    it('makes required properites into optionals', () => {
      const target = t.obj({ prop: t.string });
      const result = t.partial(target);

      const ExpectedResult = t.obj({ prop: t.string.opt() });
      type ExpectedResult = t.Infer<typeof ExpectedResult>;
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof result>;
      type ExpectedResultShape = { prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedResult);
    });

    it('is shallow', () => {
      const nestedObj = t.obj({ prop: t.bigint });
      const target = t.obj({ prop: t.string, nested: nestedObj });
      const result = t.partial(target);

      const ExpectedResult = t.obj({
        prop: t.string.opt(),
        nested: t
          .obj({
            prop: t.bigint
          })
          .opt()
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof result>;
      type ExpectedResultShape = { prop?: string; nested?: { prop: bigint } };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedResult);
    });
  });

  describe('required()', () => {
    it('makes optional properites into required properties', () => {
      const target = t.obj({ optProp: t.string.opt(), normalProp: t.number });
      const result = t.required(target);
      type result = t.Resolve<typeof result>;

      const ExpectedResult = t.obj({ optProp: t.union(t.string), normalProp: t.number });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultTsType = t.Infer<typeof result>;
      type ExpectedResultTsType = { optProp: string; normalProp: number };
      expectTypesSupportAssignment<ExpectedResultTsType, ResultTsType>();
      expectTypesSupportAssignment<ResultTsType, ExpectedResultTsType>();

      expect(result).toEqual(ExpectedResult);
    });

    it('is shallow', () => {
      const nestedObj = t.obj({ prop: t.bigint.opt() });
      const target = t.obj({ prop: t.string.opt(), nested: nestedObj.opt() });
      const result = t.required(target);

      const ExpectedResult = t.obj({
        prop: t.union(t.string),
        nested: t.union(
          t.obj({
            prop: t.bigint.opt()
          })
        )
      });

      type ResultType = t.Resolve<typeof result>['shape']['nested']['memberTypes'][0]['shape']['prop'];

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
      type ResultTsType = t.Infer<typeof result>;
      expect(t.areEqual(result.shape.prop0, t.string)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop1');
    });
  });

  describe('omit()', () => {
    it('removes correct properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const result = t.omit(target, 'prop0');
      type ResultTsType = t.Infer<typeof result>;
      expect(t.areEqual(result.shape.prop1, t.bigint)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop0');
    });
  });

  describe('exclude()', () => {
    it('removes correct types from union', () => {
      const target = t.union(t.string, t.number, t.bigint);
      const result = t.exclude(target, t.bigint);
      type ResultTsType = t.Infer<typeof result>;

      expect(result.memberTypes.length).toEqual(2);
      expect(result.memberTypes).toContain(t.number);
      expect(result.memberTypes).toContain(t.string);
    });
  });

  describe('extract()', () => {
    it('returns types from union in extraction set', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const result = t.extract(target, t.bigint, t.number);
      type ResultTsType = t.Infer<typeof result>;

      expect(result.memberTypes.length).toEqual(2);
      expect(result.memberTypes).toContain(t.bigint);
      expect(result.memberTypes).toContain(t.number);
    });

    it('extracting from outside the set returns empty', () => {
      const target = t.union(t.number, t.bigint, t.boolean);
      const result = t.extract(target, t.literal('foo'));

      expect(result.kind).toEqual('union');
      expect(result.memberTypes).toEqual([]);
    });
  });

  describe('stress tests', () => {
    it('can handle lots of chained operations of overlapping', () => {
      const B = t.obj({ prop0: t.boolean });
      const C = t.obj({ prop0: t.boolean, distinctProp: t.number });

      class ADef {
        propBool = t.boolean;
        propNum = t.number;
        propBigInt = t.bigint;
        propString = t.string;
        propArray = t.array(t.string);
        propRecursive = t.array(t.obj(ADef));
        propStringLiteral = t.literal('hello');
        propNumberLiteral = t.literal(1);
        propUnion = t.union(t.number, t.bigint, C, B);
        propB = B;
        propC = C.opt();
        self = t.obj(ADef);
        dRef = t.obj(DDef);
      }

      class DDef {
        propBool = t.boolean;
        propNum = t.number;
        propBigInt = t.bigint;
        propString = t.string;
        propArray = t.array(t.string);
        propRecursive = t.array(t.union(t.obj(ADef), t.obj(DDef)));
        propStringLiteral = t.literal('hello');
        propNumberLiteral = t.literal(1);
        propUnion = t.union(t.number, t.bigint, C, B);
        propB = B;
        propC = C.opt();
        self = t.obj(DDef);
        aRef = t.obj(ADef);
      }

      const D = t.obj(DDef);
      const A = t.obj(ADef);
      type ACons = typeof A;
      type A = t.Infer<ACons>;
      const result = t.pick(
        t.omit(t.intersection(A, t.omit(C, C.k.distinctProp)), A.k.propNumberLiteral),
        'propRecursive',
        'propNum',
        'self'
      );
      type ResultTsType = t.Infer<typeof result>;
      const another = t.pick(result, 'self');
      type AnotherTsType = t.Infer<typeof another>;
      const unionedWithAny = t.union(result, t.obj({ adfaf: t.string }), t.any);
      type UnionedTsType = t.Infer<typeof unionedWithAny>;
    });
  });
});
