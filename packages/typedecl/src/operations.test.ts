/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Type operations', () => {
  describe('intersection()', () => {
    it('objects with distinct properties are merged', () => {
      const objA = t.obj({ propA: t.string });
      const objB = t.obj({ propB: t.number });
      const result = t.intersection(objA, objB);

      const ExpectedDefinitionType = t.obj({
        propA: t.string,
        propB: t.number
      });
      type ExpectedDefinitionType = typeof ExpectedDefinitionType;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof result>;
      type ExpectedResultShape = { propA: string; propB: number };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedDefinitionType);
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
        type ObjABC = t.ToTsType<typeof ObjABC>;
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
        type ObjAB = t.ToTsType<typeof ObjAB>;

        const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

        const ObjCD = t.intersection(ObjC, ObjD);
        type ObjCD = t.ToTsType<typeof ObjCD>;
        const resultInstanceCD: ObjCD = { prop0: true, distinctProp: 'what' };

        type ObjCDIntersect = typeof ObjC & typeof ObjD;

        const instanceTestObjCDIntersect: ObjCDIntersect = t.obj({
          prop0: t.boolean,
          distinctProp: t.string
        });

        type ObjCDTsIntersect = t.ToTsType<typeof ObjC> & t.ToTsType<typeof ObjD>;

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
        type ObjAB = t.ToTsType<typeof ObjAB>;

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

      const ExpectedResult = t.obj({ prop: t.opt(t.string) });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof result>;
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
        prop: t.opt(t.string),
        nested: t.opt(
          t.obj({
            prop: t.bigint
          })
        )
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof result>;
      type ExpectedResultShape = { prop?: string; nested?: { prop: bigint } };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedResult);
    });
  });

  describe('required()', () => {
    it('makes optional properites into required properties', () => {
      const target = t.obj({ prop: t.opt(t.string) });
      const result = t.required(target);

      const ExpectedResult = t.obj({ prop: t.string });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultTsType = t.ToTsType<typeof result>;
      type ExpectedResultTsType = { prop: string };
      expectTypesSupportAssignment<ExpectedResultTsType, ResultTsType>();
      expectTypesSupportAssignment<ResultTsType, ExpectedResultTsType>();

      expect(result).toEqual(ExpectedResult);
    });

    it('is shallow', () => {
      const nestedObj = t.obj({ prop: t.opt(t.bigint) });
      const target = t.obj({ prop: t.opt(t.string), nested: t.opt(nestedObj) });
      const result = t.required(target);

      const ExpectedResult = t.obj({
        prop: t.string,
        nested: t.obj({
          prop: t.opt(t.bigint)
        })
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultTsType = t.ToTsType<typeof result>;
      type ExpectedResultTsType = { prop: string; nested: { prop?: bigint } };
      expectTypesSupportAssignment<ExpectedResultTsType, ResultTsType>();
      expectTypesSupportAssignment<ResultTsType, ExpectedResultTsType>();

      expect(result).toEqual(ExpectedResult);
    });
  });

  describe('readonly()', () => {
    it('makes writable properites into readonly', () => {
      const target = t.obj({ prop: t.string });
      const result = t.readonly(target);

      const ExpectedResult = t.obj({ prop: t.ro(t.string) });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof result>;
      type ExpectedResultShape = { readonly prop: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedResult);
    });

    it('is shallow', () => {
      const nestedObj = t.obj({ prop: t.bigint });
      const target = t.obj({ prop: t.string, nested: nestedObj });
      const result = t.readonly(target);

      const ExpectedResult = t.obj({
        prop: t.ro(t.string),
        nested: t.ro(
          t.obj({
            prop: t.bigint
          })
        )
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
      expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof result>;
      type ExpectedResultShape = { readonly prop: string; readonly nested: { prop: bigint } };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

      expect(result).toEqual(ExpectedResult);
    });
  });

  describe('pick()', () => {
    it('selects correct properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const result = t.pick(target, 'prop0');
      type ResultTsType = t.ToTsType<typeof result>;
      expect(t.areEqual(result.shape.prop0.type, t.string)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop1');
    });
  });

  describe('omit()', () => {
    it('removes correct properties', () => {
      const target = t.obj({ prop0: t.string, prop1: t.bigint });
      const result = t.omit(target, 'prop0');
      type ResultTsType = t.ToTsType<typeof result>;
      expect(t.areEqual(result.shape.prop1.type, t.bigint)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop0');
    });
  });

  describe('exclude()', () => {
    it('removes correct types from union', () => {
      const target = t.union(t.string, t.number, t.bigint);
      const result = t.exclude(target, t.bigint);
      type ResultTsType = t.ToTsType<typeof result>;
      if (result.kind === 'never') {
        throw Error();
      }
      expect(result.memberTypes.length).toEqual(2);
      expect(result.memberTypes).toContain(t.number);
      expect(result.memberTypes).toContain(t.string);
    });

    it('collapses from union to single type when single element left', () => {
      const target = t.union(t.number, t.bigint, t.string);
      const result = t.exclude(target, t.bigint, t.string);

      expect(result).toEqual(t.number);
    });
  });

  describe('extract()', () => {
    it('returns types from union in extraction set', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const result = t.extract(target, t.bigint, t.number);
      type ResultTsType = t.ToTsType<typeof result>;
      if (result.kind === 'never') {
        throw Error();
      }

      expect(result.memberTypes.length).toEqual(2);
      expect(result.memberTypes).toContain(t.bigint);
      expect(result.memberTypes).toContain(t.number);
    });

    it('collapses from union to single type when single element returned', () => {
      const target = t.union(t.number, t.bigint, t.boolean);
      const result = t.extract(target, t.bigint);

      if (result.kind === 'never') {
        throw Error();
      }

      expect(result).toEqual(t.bigint);
    });

    it('extracting from outside the set returns empty', () => {
      const target = t.union(t.number, t.bigint, t.boolean);
      const result = t.extract(target, t.literal('foo'));

      expect(result.kind).toEqual('never');
    });
  });
});

describe('stress tests', () => {  
  it('can handle a very complex object hierarchy with optionals', () => {
    interface IC {
      prop0: boolean;
      distinctProp: number;
    }
    interface IB {
      prop0: boolean;
    }
    interface IA {
      propBool: boolean;
      propNum: number;
      propBigInt: bigint;
      propString: string;
      propArray: Array<string>;
      propRecursive: Array<IA>;
      propStringLiteral: 'hello';
      propNumberLiteral: 1;

      propUnion: number | bigint | IC | IB;
      propB: IB;
      propC?: IC;
    }

    const A = t.declareObj<IA>();
    const C = t.obj({ prop0: t.boolean, distinctProp: t.number });
    const B = t.obj({ prop0: t.boolean });

    t.defineDeclaration(A, {
      propBool: t.boolean,
      propNum: t.number,
      propBigInt: t.bigint,
      propString: t.string,
      propArray: t.array(t.string),
      propRecursive: t.array(A),
      propStringLiteral: t.literal('hello'),
      propNumberLiteral: t.literal(1),

      propUnion: t.union(t.number, t.bigint, C, B),
      propB: B,
      propC: t.opt(C)
    });

    type A = typeof A;
    type ATsType = t.ToTsType<A>;
    type ARoundTrip = t.ToDefinitionType<ATsType>;

    expectTypesSupportAssignment<A, ARoundTrip>();
    expectTypesSupportAssignment<ARoundTrip, A>();

    expectTypesSupportAssignment<ATsType, IA>();
    expectTypesSupportAssignment<IA, ATsType>();
  });
});