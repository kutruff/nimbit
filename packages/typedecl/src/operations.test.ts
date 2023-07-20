/* eslint-disable @typescript-eslint/no-unused-vars */
import ts from 'typescript';

import * as t from '.';
import { type ParseResult } from '.';
import { expectType, expectTypesSupportAssignment, type TypeEqual, type TypeOf } from './test/utilities';

describe('Type operations', () => {
  describe('intersection()', () => {
    describe('simple types', () => {
      it.todo('arrays');
      it.todo('map');
      it.todo('set');

      it('intersects simple types', () => {
        const result = t.intersection(t.number, t.number);
        type result = t.Infer<typeof result>;
        type resultType = t.Resolve<typeof result>;
        expectType<TypeEqual<result, number & number>>(true);
        expect(result).toEqual(t.number);
      });

      it('returns never for non matching types', () => {
        const result = t.intersection(t.number, t.string);
        type result = t.Infer<typeof result>;
        type resultType = t.Resolve<typeof result>;
        expectType<TypeEqual<result, number & string>>(true);

        expect(result).toEqual(t.never);
      });

      it('returns entire union for equal union types', () => {
        const result = t.intersection(t.union(t.number, t.string), t.union(t.number, t.string));
        type result = t.Infer<typeof result>;
        type resultType = t.Resolve<typeof result>;
        expectType<TypeEqual<result, (number | string) & (number | string)>>(true);

        expect(result).toEqual(t.union(t.number, t.string));
      });

      it('returns subset of union for overlapping union types', () => {
        const result = t.intersection(t.union(t.number, t.string, t.bigint), t.union(t.number, t.string));
        type result = t.Infer<typeof result>;
        type resultType = t.Resolve<typeof result>;

        expectType<TypeEqual<result, (number | string | bigint) & (number | string)>>(true);

        expect(result).toEqual(t.union(t.number, t.string));
      });
    });

    describe('objects with distinct properties', () => {
      it('merges them', () => {
        const objA = t.obj({ propA: t.string });
        const objB = t.obj({ propB: t.number });
        const result = t.intersection(objA, objB);
        type Result = t.Infer<typeof result>;

        const ExpectedDefinitionType = t.obj({
          propA: t.string,
          propB: t.number
        });

        expectType<TypeOf<typeof ExpectedDefinitionType, typeof result>>(true);
        expectType<TypeOf<typeof result, typeof ExpectedDefinitionType>>(true);

        expectType<TypeEqual<Result, t.Resolve<{ propA: string } & { propB: number }>>>(true);

        expect(result).toEqual(ExpectedDefinitionType);
      });
    });
    type MyIntersect<T, U> = [T] extends [U] ? T : [U] extends [T] ? U : T & U;
    describe('object properties with same name', () => {
      it('merges objects with union overlapping union properties', () => {
        const objA = t.obj({ prop: t.union(t.string, t.date) });
        const objB = t.obj({ prop: t.union(t.string, t.number) });
        const result = t.intersection(objA, objB);
        type Result = t.Infer<typeof result>;

        const expectedType = t.obj({
          prop: t.string
        });
        const ExpectedDefinitionType = expectedType as t.Typ<
          'object',
          typeof expectedType.shape,
          (typeof expectedType)[typeof t._type]
        >;

        // type ExpectedDefinitionType = typeof ExpectedDefinitionType;

        //Danger: this will run into TS excessive depth problems but only for the types
        // const one: ExpectedDefinitionType = {} as unknown as typeof result;
        // const two: typeof result = {} as unknown as ExpectedDefinitionType;
        // expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
        // expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

        expect(result.shape).toEqual({ prop: t.string });

        // type alsdflka = (typeof result)['shape']['prop'];
        // const foo = {} as any as alsdflka;
        // // type resdaadsf = t.Intersect<typeof objA, typeof objB>;
        // type ABIntersected = t.Intersect<typeof objA, typeof objB>;
        // type resdaadsfadf = t.Resolve<t.Intersect<typeof objA, typeof objB>>;
        // type resdaadsfadfafd = t.Resolve<t.Intersect<typeof objA, typeof objB>>['shape']['prop'];
        // expectType<TypeOf<(typeof ExpectedDefinitionType)['shape']['prop'], ABIntersected['shape']['prop']>>(true);

        // const resdult = result.parse({ prop: 'hello' });
        // type resdaadsdf = MyIntersect<typeof objA.shape, typeof objB.shape>;
        // expectType<TypeOf<(typeof ExpectedDefinitionType)['shape'], t.Resolve<(typeof result)['shape']>>>(true);
        expectType<TypeOf<typeof result, typeof ExpectedDefinitionType>>(true);

        //Not sure why they aren't reflexive
        // expectType<TypeOf<typeof ExpectedDefinitionType, typeof result>>(true);

        const fooda = result.to(t.string, x => t.pass(x.toString()));
        const again = t.intersection(result, t.obj({ anotherProp: t.string }));
        again.shape.anotherProp;
        expectType<TypeEqual<Result, t.Resolve<{ prop: string | Date } & { prop: string | number }>>>(true);

        expect(result).toEqual(ExpectedDefinitionType);
      });

      it('sets non-overlapping union properties to never', () => {
        const objA = t.obj({ prop: t.union(t.bigint, t.date) });
        const objB = t.obj({ prop: t.union(t.string, t.number) });
        const result = t.intersection(objA, objB);

        const ExpectedDefinitionType = t.obj({
          prop: t.union(t.string)
        });

        type ExpectedDefinitionType = typeof ExpectedDefinitionType;
        type fooo = (typeof result)['shape']['prop'];
        //Danger: this will run into TS excessive depth problems but only for the types
        // const one: ExpectedDefinitionType = {} as unknown as typeof result;
        // const two: typeof result = {} as unknown as ExpectedDefinitionType;
        // expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
        // expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

        type ResultShape = t.Infer<typeof result>;
        type ExpectedResultShape = { prop: (bigint | Date) & (string | number) };
        expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
        expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

        expect(result).toEqual(t.never);
      });

      it('allows decent depth of union properties', () => {
        const objA = t.obj({ prop: t.union(t.string, t.date) });
        const objB = t.obj({ prop: t.union(t.string) });
        const result = t.intersection(objA, objB);

        const ExpectedDefinitionType = t.obj({
          prop: t.string
        });

        //Danger: testing the ObjTypes will run into TS excessive depth problems but should not affect TsType
        // const one: ExpectedDefinitionType = {} as unknown as typeof result;
        // const two: typeof result = {} as unknown as ExpectedDefinitionType;
        // expectTypesSupportAssignment<ExpectedDefinitionType, typeof result>();
        // expectTypesSupportAssignment<typeof result, ExpectedDefinitionType>();

        type ResultShape = t.Infer<typeof result>;
        type ExpectedResultShape = { prop: string };
        expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
        expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();

        expect(result).toEqual(ExpectedDefinitionType);
        const objC = t.obj({ prop: t.union(t.string, t.bigint) });
        const resultC = t.intersection(result, objC);

        type resultC = t.Infer<typeof resultC>;

        const objD = t.obj({ prop: t.union(t.string, t.bigint) });
        const resultD = t.intersection(resultC, objD);

        type resultD = t.Infer<typeof resultD>;

        const objE = t.obj({ prop: t.union(t.string, t.bigint), prop2: t.union(t.string, t.bigint).opt() });
        const resultE = t.intersection(resultD, objE);
        const excluded = t.extend(resultE, t.obj({ prop2: t.exclude(resultE.shape.prop2, t.string) }));
        type excluded = t.Infer<typeof excluded>;
        type resultE = t.Infer<typeof resultE>;

        const toF = resultE.to(t.string, x => t.pass(x.toString()));

        expect(objC.parse({ prop: 'hello' }).success).toEqual(true);
        expect(resultC.parse({ prop: 'hello' }).success).toEqual(true);
        expect(resultD.parse({ prop: 'hello' }).success).toEqual(true);
        expect(resultE.parse({ prop: 'hello' }).success).toEqual(true);
        expect(toF.parse({ prop: 'hello' }).success).toEqual(true);
      });
    });

    describe('and a property is of type AnyType', () => {
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
        expect(resultAB.shape.prop).toEqual(t.any);

        const resultBA = t.intersection(objA, objB);
        expect(resultBA.shape.prop).toEqual(t.any);
      });
    });

    describe('Nested objects', () => {
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

        // type ObjCDIntersect = t.ObjIntersection<typeof ObjC, typeof ObjD>;

        // const instanceTestObjCDIntersect: ObjCDIntersect = t.obj({
        //   prop0: t.boolean,
        //   distinctProp: t.string
        // });

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
          x: E | D;
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
        const ObjB = t.obj({ x: t.union(ObjE, ObjD) });
        const ObjC = t.obj({ x: ObjF });

        const ObjABC = t.intersection(t.intersection(ObjA, ObjB), ObjC);
        type ObjABC = t.Infer<typeof ObjABC>;
        const resultInstance: ObjABC = { x: { prop0: true, distinctProp: 1 } };

        // console.log(ObjABC.shape.x.unionTypes.map(x => Object.keys(x.shape)).join('\n-----'));
        //TODO: Right now this isn't simplifying the union.
        expect(ObjABC).toEqual(
          t.obj({
            x: t.union(
              t.obj({
                prop0: t.boolean,
                distinctProp: t.number
              }),
              t.obj({
                prop0: t.boolean,
                distinctProp: t.number
              })
            )
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
        // Both of the following should not compile:
        //   const ab: AB = {};
        //   const ab: AB = { x: true };
        // expectType<TypeEqual<AB, {}>>(false);
        expectType<TypeEqual<AB, { x: { prop0: boolean } }>>(false);

        type CD = C & D;
        // this also resolves to never
        //const cd : CD = {};

        //We set them as matching here. Hard to test prop0 set to t.number because it breaks the compilation which is intended
        const ObjC = t.obj({ prop0: t.boolean });
        const ObjD = t.obj({ prop0: t.number, distinctProp: t.string });

        const ObjA = t.obj({ x: ObjC });
        const ObjB = t.obj({ x: ObjD });

        const ObjAB = t.intersection(ObjA, ObjB);
        type ObjAB = t.Infer<typeof ObjAB>;
        const Expected = t.obj({
          x: t.never
        });

        type foo = typeof ObjAB.shape.x.shape.prop0;

        // expectType<TypeOf<typeof ObjAB, typeof Expected>>(true);
        // expectType<TypeOf<typeof Expected, typeof ObjAB>>(true);
        //Should not compile:
        //const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

        expect(ObjAB).toEqual(t.never);
      });

      // it('merges nested objects in unions', () => {
      //   interface C {
      //     prop: string;
      //     propC: boolean;
      //   }

      //   interface D {
      //     prop: number;
      //     propD: string;
      //   }

      //   interface A {
      //     x: C | D;
      //   }
      //   interface B {
      //     x: D | string;
      //   }

      //   type AB = t.Resolve<A & B>;
      //   type adfadfdaf = t.Resolve<AB['x']>;
      //   type adfadf = t.Resolve<C & string>;
      //   type adfaddf = t.Resolve<A['x']>;

      //   const foo: AB = { x: { prop: 1, propD: 'what' } };
      //   const foodafad: adfaddf = { prop: 'hel', propC: false };
      //   type CD = t.Resolve<C & D>;

      //   //We set them as matching here. Hard to test prop0 set to t.num because it breaks the compilation which is intended
      //   const ObjC = t.obj({ prop: t.string });
      //   const ObjD = t.obj({ prop: t.number, propD: t.string });

      //   type ObjCAndD = t.ObjType<
      //     (typeof ObjC)['shape'] & (typeof ObjD)['shape'],
      //     (typeof ObjC)[typeof t._type] & (typeof ObjD)[typeof t._type]
      //   >;
      //   const dasfadf = {} as ObjCAndD;
      //   const adfadf = dasfadf.shape;
      //   const ObjA = t.obj({ x: t.union(ObjC, ObjD) });
      //   const ObjB = t.obj({ x: t.union(ObjD, t.string) });

      //   const ObjAB = t.intersectObj(ObjA, ObjB);
      //   type ObjAB = t.Resolve<t.Infer<typeof ObjAB>>;

      //   //Should not compile:
      //   //const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

      //   console.log((ObjAB.shape as any).x.memberTypes[0].shape);
      //   // console.log(ObjAB.shape.x.memberTypes[1]!.shape);

      //   expect(ObjAB).toEqual(
      //     t.obj({
      //       x: t.union(t.obj({ prop: t.never, propD: t.string }), t.obj({ prop: t.never, propD: t.string }))
      //     })
      //   );
      // });
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

  describe('extend()', () => {
    it('overrides distinct properties', () => {
      const objA = t.obj({ propA: t.string });
      const objB = t.obj({ propB: t.number });
      const Result = t.extend(objA, objB);
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
      const Result = t.extend(objA, objB);
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
      const target = t.obj({ prop: t.string });
      const Result = t.partial(target);
      type Result = t.Infer<typeof Result>;

      const ExpectedDefinition = t.obj({ prop: t.string.opt() });
      type ExpectedDefinition = t.Infer<typeof ExpectedDefinition>;

      expectType<TypeEqual<typeof Result, typeof ExpectedDefinition>>(true);

      expectTypesSupportAssignment<typeof ExpectedDefinition, typeof Result>();
      expectTypesSupportAssignment<typeof Result, typeof ExpectedDefinition>();

      type ExpectedResult = { prop?: string };
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
      type ResultTsType = t.Infer<typeof result>;
      expect(t.areEqual(result.shape.prop0, t.string)).toEqual(true);
      expect(result.shape).not.toHaveProperty('prop1');
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

  describe('exclude()', () => {
    it.todo('check for literals and strings in both directions');

    it('does not exclude single type outside set', () => {
      const Result = t.exclude(t.string, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, string>>(true);
      const expected = t.string;
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('does not exclude unions when out of set', () => {
      const target = t.union(t.number, t.string, t.bigint, t.boolean);
      const Result = t.exclude(target, t.literal('foo'));
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<typeof Result, typeof target>>(true);

      expect(Result).toEqual(target);
    });

    it('excludes subset of union', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const Result = t.exclude(target, t.string);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, bigint | number>>(true);
      const expected = t.union(t.number, t.bigint);
      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('excludes unions of unions works', () => {
      const target = t.union(t.union(t.boolean, t.string, t.number, t.date));
      const flattened = t.flattenUnion(target);
      const Result = t.exclude(target, t.union(t.string, t.bigint, t.boolean));
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
      const Result = t.exclude(target, t.union(t.number, t.string, t.bigint, t.boolean));
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
        a2 = t.exclude(t.flattenUnion(t.union(t.obj(ADef), t.union(t.obj(BDef), t.undef), t.string)), t.string);
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

    it('returns types from union in extraction set', () => {
      const target = t.union(t.string, t.number, t.bigint);

      const Result = t.extract(target, t.bigint, t.number);
      type Result = t.Infer<typeof Result>;

      expectType<TypeEqual<Result, bigint | number>>(true);
      const expected = t.union(t.number, t.bigint);
      // expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expect(Result).toEqual(expected);
    });

    it('extracting unions of unions works', () => {
      const target = t.union(t.union(t.boolean, t.string));
      const Result = t.extract(target, t.union(t.string, t.bigint, t.boolean));

      type Result = t.Infer<typeof Result>;
      expectType<TypeEqual<Result, string | boolean>>(true);
      const expected = t.union(t.boolean, t.string);
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
        self = t.obj(ADef).opt();
        dRef = t.obj(DDef).opt();
      }

      class DDef {
        propBool = t.boolean;
        propNum = t.number;
        propBigInt = t.bigint;
        propString = t.string;
        propArray = t.array(t.union(t.string, t.number));
        propRecursive = t.array(t.union(t.obj(ADef), t.obj(DDef)));
        propStringLiteral = t.literal('hello');
        propNumberLiteral = t.literal(1);
        propUnion = t.union(t.number, t.bigint, C, B);
        propB = B;
        propC = C.opt();
        self = t.obj(DDef).opt();
        aRef = t.obj(ADef);
      }

      const D = t.obj(DDef);
      const A = t.obj(ADef);
      type ACons = typeof A;
      type A = t.Infer<ACons>;
      const result = t.pick(
        t.omit(t.intersection(A, t.omit(C, 'distinctProp')), 'propNumberLiteral'),
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
