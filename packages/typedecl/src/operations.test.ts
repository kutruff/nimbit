import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Type operations', () => {
  describe('intersection()', () => {
    it('objects with distinct properties are merged', () => {
      const objA = t.obj({ propA: t.str });
      const objB = t.obj({ propB: t.num });
      const result = t.intersection(objA, objB);

      const ExpectedDefinitionType = t.obj({
        propA: t.str,
        propB: t.num
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

        const ObjD = t.obj({ prop0: t.bool });
        const ObjE = t.obj({ prop0: t.bool });
        const ObjF = t.obj({ prop0: t.bool, distinctProp: t.num });
        const ObjA = t.obj({ x: ObjD });
        const ObjB = t.obj({ x: ObjE });
        const ObjC = t.obj({ x: ObjF });

        const ObjABC = t.intersection(t.intersection(ObjA, ObjB), ObjC);
        type ObjABC = t.ToTsType<typeof ObjABC>;
        const resultInstance: ObjABC = { x: { prop0: true, distinctProp: 1 } };

        expect(ObjABC).toEqual(
          t.obj({
            x: t.obj({
              prop0: t.bool,
              distinctProp: t.num
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
        const ObjC = t.obj({ prop0: t.bool });
        const ObjD = t.obj({ prop0: t.bool, distinctProp: t.str });

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
          prop0: t.bool,
          distinctProp: t.str
        });

        type ObjCDTsIntersect = t.ToTsType<typeof ObjC> & t.ToTsType<typeof ObjD>;

        const instanceTestObjCD: ObjCDTsIntersect = {
          prop0: true,
          distinctProp: 'what'
        };

        expect(ObjAB).toEqual(
          t.obj({
            x: t.obj({
              prop0: t.bool,
              distinctProp: t.str
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
        const ObjC = t.obj({ prop0: t.bool });
        const ObjD = t.obj({ prop0: t.num, distinctProp: t.str });

        const ObjA = t.obj({ x: ObjC });
        const ObjB = t.obj({ x: ObjD });

        const ObjAB = t.intersection(ObjA, ObjB);
        type ObjAB = t.ToTsType<typeof ObjAB>;

        //Should not compile:
        //const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

        expect(ObjAB).toEqual(
          t.obj({
            x: t.nevr
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

      // eslint-disable-next-line jest/expect-expect
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
      const target = t.obj({ prop: t.str });
      const result = t.partial(target);

      const ExpectedResult = t.obj({ prop: t.optProp(t.str) });
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
      const nestedObj = t.obj({ prop: t.bgint });
      const target = t.obj({ prop: t.str, nested: nestedObj });
      const result = t.partial(target);

      const ExpectedResult = t.obj({
        prop: t.optProp(t.str),
        nested: t.optProp(
          t.obj({
            prop: t.bgint
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
      const target = t.obj({ prop: t.optProp(t.str) });
      const result = t.required(target);

      const ExpectedResult = t.obj({ prop: t.str });
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
      const nestedObj = t.obj({ prop: t.optProp(t.bgint) });
      const target = t.obj({ prop: t.optProp(t.str), nested: t.optProp(nestedObj) });
      const result = t.required(target);

      const ExpectedResult = t.obj({
        prop: t.str,
        nested: t.obj({
          prop: t.optProp(t.bgint)
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
      const target = t.obj({ prop: t.str });
      const result = t.readonly(target);

      const ExpectedResult = t.obj({ prop: t.roProp(t.str) });
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
      const nestedObj = t.obj({ prop: t.bgint });
      const target = t.obj({ prop: t.str, nested: nestedObj });
      const result = t.readonly(target);

      const ExpectedResult = t.obj({
        prop: t.roProp(t.str),
        nested: t.roProp(
          t.obj({
            prop: t.bgint
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
      const target = t.obj({ prop0: t.str, prop1: t.bgint });
      const result = t.pick(target, 'prop0');
      type ResultTsType = t.ToTsType<typeof result>;
      expect(t.areEqual(result.objectDefinition.prop0.type, t.str)).toEqual(true);
      expect(result.objectDefinition).not.toHaveProperty('prop1');
    });
  });

  describe('omit()', () => {
    it('removes correct properties', () => {
      const target = t.obj({ prop0: t.str, prop1: t.bgint });
      const result = t.omit(target, 'prop0');
      type ResultTsType = t.ToTsType<typeof result>;
      expect(t.areEqual(result.objectDefinition.prop1.type, t.bgint)).toEqual(true);
      expect(result.objectDefinition).not.toHaveProperty('prop0');
    });
  });

  describe('exclude()', () => {
    it('removes correct types from union', () => {
      const target = t.union(t.str, t.num, t.bgint);
      const result = t.exclude(target, t.bgint);
      type ResultTsType = t.ToTsType<typeof result>;
      if (result.kind === 'never') {
        throw Error();
      }
      expect(result.memberTypes.length).toEqual(2);
      expect(result.memberTypes).toContain(t.num);
      expect(result.memberTypes).toContain(t.str);
    });

    it('collapses from union to single type when single element left', () => {
      const target = t.union(t.num, t.bgint, t.str);
      const result = t.exclude(target, t.bgint, t.str);

      expect(result).toEqual(t.num);
    });
  });

  describe('extract()', () => {
    it('returns types from union in extraction set', () => {
      const target = t.union(t.str, t.num, t.bgint);

      const result = t.extract(target, t.bgint, t.num);
      type ResultTsType = t.ToTsType<typeof result>;
      if (result.kind === 'never') {
        throw Error();
      }

      expect(result.memberTypes.length).toEqual(2);
      expect(result.memberTypes).toContain(t.bgint);
      expect(result.memberTypes).toContain(t.num);
    });

    it('collapses from union to single type when single element returned', () => {
      const target = t.union(t.num, t.bgint, t.bool);
      const result = t.extract(target, t.bgint);

      if (result.kind === 'never') {
        throw Error();
      }

      expect(result).toEqual(t.bgint);
    });

    it('extracting from outside the set returns empty', () => {
      const target = t.union(t.num, t.bgint, t.bool);
      const result = t.extract(target, t.literal('foo'));

      expect(result.kind).toEqual('never');
    });
  });
});

describe('stress tests', () => {
  // eslint-disable-next-line jest/expect-expect
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
    const C = t.obj({ prop0: t.bool, distinctProp: t.num });
    const B = t.obj({ prop0: t.bool });

    t.defineDeclaration(A, {
      propBool: t.bool,
      propNum: t.num,
      propBigInt: t.bgint,
      propString: t.str,
      propArray: t.array(t.str),
      propRecursive: t.array(A),
      propStringLiteral: t.literal('hello'),
      propNumberLiteral: t.literal(1),

      propUnion: t.union(t.num, t.bgint, C, B),
      propB: B,
      propC: t.optProp(C)
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
