/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { intersection } from './intersection';
import { expectType, expectTypesSupportAssignment, type TypeEqual } from './test/utilities';

describe.skip('obj2', () => {
  it('creates object', () => {
    const A = t.obj({ prop: t.string });
    type A = t.Infer<typeof A>;

    const B = t.obj({ prop: t.string.opt() });
    type B = t.Infer<typeof B>;

    const U1 = t.union(t.string, t.number);
    type U1 = t.Infer<typeof U>;

    const U = t.union(t.string, t.number);
    type UT = t.TsType<typeof U>;
    type U = t.Infer<typeof U>;
    const uRes = U.shape;

    const Arr = t.array(t.string);
    type ArrT = t.TsType<typeof Arr>;
    type Arr = t.Infer<typeof Arr>;
    const arrRes = Arr.shape;

    const Tup = t.tuple([t.string, t.number]);
    type TupT = t.TsType<typeof Tup>;
    type Tup = t.Infer<typeof Tup>;
    const tupRes = Tup.shape[0]!;

    const ComplexA = t.obj({ prop: t.string, a: A, u: U, arr: Arr, tup: Tup });
    type ComplexA = t.Infer<typeof ComplexA>;

    const ComplexB = t.obj({ prop: t.string, a: A, u: U, arr: Arr, tup: Tup });
    type ComplexB = t.Infer<typeof ComplexB>;

    const int1Res = intersection(t.number, t.string);
    const int2Res = intersection(t.number, U);
    type adfadfadga = (typeof U)['shape'] & undefined extends never ? true : false;

    const InterComplexRes1 = intersection(ComplexA, ComplexB);
    type InterComplexRes1 = t.Infer<typeof InterComplexRes1>;

    const UnionPropIntersection = intersection(t.obj({ prop: t.union(t.string, t.number) }), t.obj({ prop: t.string }));
    type res = typeof UnionPropIntersection.shape.prop.shape;
  });

  it('merges nested objects in unions', () => {
    interface C {
      prop: string;
      // propC: boolean;
    }

    interface D {
      prop: number;
      propD: string;
    }

    interface A {
      x: C | D;
    }
    interface B {
      x: D | string;
    }

    type AB = t.Resolve<A & B>;
    type adfadfdaf = t.Resolve<AB['x']>;
    type adfadf = t.Resolve<C & string>;
    type adfaddf = t.Resolve<A['x']>;

    const foo: A & B = { x: { prop: 1, propD: 'what' } };
    // const adfadfagdfg: A & B = { x: 'hello' };
    const foodafad: adfaddf = { prop: 'hel' };
    type CD = t.Resolve<C & D>;

    //We set them as matching here. Hard to test prop0 set to t.num because it breaks the compilation which is intended
    const ObjC = t.obj({ prop: t.string });
    const ObjD = t.obj({ prop: t.number, propD: t.string });
    const ObjA = t.obj({ x: t.union(ObjC, ObjD) });
    type ObjAT = t.Resolve<typeof ObjA>;
    type ObjA = t.Infer<typeof ObjA>;

    const ObjB = t.obj({ x: t.union(ObjD, t.string) });

    type ObjBT = t.Resolve<typeof ObjB>;
    type ObjB = t.Infer<typeof ObjB>;

    const ObjAB = intersection(ObjA, ObjB);
    type ObjAB = t.Infer<typeof ObjAB>;
    type ObjABShape = t.Resolve<(typeof ObjAB)['shape']>;
    type ObjABShapeX = t.Resolve<(typeof ObjAB)['shape']>['x'];
    type ObjABShapeXShape = t.Resolve<(typeof ObjAB)['shape']>['x']['shape'];
    // type ObjABShapeXShapeProp = t.Resolve<(typeof ObjAB)['shape']>['x']['shape']['prop'];

    // type algdjolijhkagdhfoih = typeof ObjAB.shape.x.shape.prop.shape extends string ? true : false;

    type addladgkjhlkhjlag = keyof ({ x: string } | { b: string });
    //Should not compile:
    //const resultInstanceAB: ObjAB = { x: { prop0: true, distinctProp: 'what' } };

    // console.log(ObjAB.shape.x.memberTypes[0].shape);
    // console.log(ObjAB.parse({ x: { prop: 1, propD: 'what' } }));
    // type ABSha = t.Resolve<(typeof ObjA)['shape']['x'] & (typeof ObjB)['shape']['x']>['shape']['prop'];
    type intered = t.Resolve<(typeof ObjA)['shape'] & (typeof ObjB)['shape']>;
    type interedX = t.Resolve<intered['x']>;
    type interedXShape = t.Resolve<interedX['shape']>;
    // type interedXShapeProp = interedXShape['prop'];

    type ObjAX = (typeof ObjA)['shape']['x'];
    type ObjBX = (typeof ObjB)['shape']['x'];
    const ObjCD = t.union(ObjC, ObjD);
    type ObjCDT = t.Resolve<typeof ObjCD>['shape'];
    type ObjCD = t.Infer<typeof ObjCD>;

    const ObjCDI = intersection(ObjC, ObjD);
    type ObjCDIT = (typeof ObjCDI)['shape']['prop'];
    type ObjCDI = t.Infer<typeof ObjCDI>;

    type AInterB = (typeof ObjA & typeof ObjB)['shape'];

    const ManualIntersection = {} as unknown as typeof ObjA & typeof ObjB;
    // const propParseManual = ObjAB.shape.x.parse({ prop: 'what', propD: 'what' });

    // const shouldBeObject: t.Resolve<typeof ObjAB.shape.x.kind> = 'object';
    // expectType<TypeEqual<typeof ObjAB.shape.x.kind, 'object'>>(true);
    // expectType<TypeEqual<typeof ObjAB.shape.x.kind, 'string'>>(false);

    //TODO: deep object merges will get screwed up for whatever reason.
    // const xShouldBeBad: typeof ObjAB.shape.x.shape.prop.shape = 'hello';
    // const xShapeShouldWork: typeof ObjAB.shape.x.shape.prop.shape = 1;
    // const propParse = ObjAB.shape.x.parse({ prop: 1, propD: 'what' });
    // const resultNum = ObjAB.parse({ x: { prop: 1, propD: 'what' } });
    // const resultStr = ObjAB.parse({ x: { prop: 'bad', propD: 'what' } });
    // expect(ObjAB).toEqual(
    //   t.obj({
    //     x: t.union(t.obj({ prop: t.never, propD: t.string }), t.obj({ prop: t.never, propD: t.string }))
    //   })
    // );

    const ArrayTest = intersection(t.array(t.union(t.number, t.string)), t.array(t.number));
    type ArrayTestT = (typeof ArrayTest)['shape'];
    // const aadshgah : ArrayTestT = t.string2;
    type ArrayTestI = t.Infer<typeof ArrayTest>;

    // const ArrayTest = intersection(t.map2(t.union(t.number2, t.string2)), t.array(t.number2));
    // type ArrayTestT = (typeof ArrayTest)['shape']
    // // const aadshgah : ArrayTestT = t.string2;
    // type ArrayTestI = t.Infer<typeof ArrayTest>;
  });

  type what = { a: string } & { b: number };
  type wdafat = string & number;

  it('allows mutual recursion', () => {
    class ADef {
      b? = t.obj(BDef).opt();
      strProp = t.string;
    }

    class BDef {
      a? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const B = t.obj(BDef);
    type B = t.Infer<typeof B>;

    expect(A.shape.b).toEqual(t.obj(BDef).opt());
    expect(B.shape.a).toEqual(t.obj(ADef).opt());

    type ExpectedAShape = { b?: B; strProp: string };
    expectType<TypeEqual<A, ExpectedAShape>>(true);

    type ExpectedBShape = { a?: A };
    expectType<TypeEqual<B, ExpectedBShape>>(true);
  });

  it('supports self references with arrays', () => {
    class ADef {
      children? = t.array(t.obj(ADef)).opt();
      self? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const rafdaf = A.shape.children.opt().unwrap();

    const foo: A = { children: [{ children: [] }] };

    expect(A.shape.children.members[0]).toEqual(t.array(A));

    type ExpectedAShape = { children?: A[]; self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  type readafdaf = t.UnionToIntersection<'a' | 'b'>;

  // function exclude<TShape, K extends t.Typ2<unknown, unknown>[], TKind>(
  //   unionType: t.Typ2<TKind, TShape, unknown>,
  //   ...types: K
  // ): //Exclude<typeof unionType, t.ElementType2<K>> {
  // // t.Typ2<
  // //   Exclude<TShape, t.ElementType2<K>>['kind'],
  // //   Exclude<TShape, t.ElementType2<K>>,
  // //   Exclude<TShape, t.ElementType2<K>>[typeof t._type]
  // // > {
  // t.Typ2<
  //   Exclude<(typeof unionType)['kind'], t.ElementType2<K>['kind']>,
  //   Exclude<TShape, t.ElementType2<K>['shape']>,
  //   Exclude<(typeof unionType)[typeof t._type], t.ElementType2<K>[typeof t._type]>
  // > {
  //   if (!Array.isArray(unionType.shape)) {
  //     return t.never as any;
  //   }
  //   const result = unionType.shape.filter(x => !types.find(k => t.areEqual(x, k)));
  //   return t.union(...result) as any;
  // }

  function exclude<TU extends t.Typ<unknown, unknown, unknown>, K extends t.Typ<unknown, unknown>[]>(
    unionType: TU,
    ...types: K
  ): //Exclude<typeof unionType, t.ElementType2<K>> {
  t.Typ<
    Exclude<TU['kind'], t.ElementType<K>['kind']>,
    Exclude<TU['shape'], t.ElementType<K>['shape']>,
    Exclude<TU[typeof t._type], t.ElementType<K>[typeof t._type]>
  > {
    // Exclude<TU, t.ElementType2<K>> {
    // t.Typ2<
    //   Exclude<(typeof unionType)['kind'], t.ElementType2<K>['kind']>,
    //   Exclude<(typeof unionType)['shape'], t.ElementType2<K>['shape']>,
    //   Exclude<(typeof unionType)[typeof t._type], t.ElementType2<K>[typeof t._type]>
    // > {
    if (!Array.isArray(unionType.shape)) {
      return t.never as any;
    }
    const result = unionType.shape.filter(x => !types.find(k => t.areEqual(x, k)));
    return t.union(...result) as any;
  }

  it('nested unions unwrapped', () => {
    const A = t.union(t.string, t.number);
    type A = t.Infer<typeof A>;

    const B = t.union(t.string, t.union(t.string), t.number, t.number);
    type B = t.Infer<typeof B>;

    const C = t.union(t.string, t.union(t.union(t.number, t.boolean), t.boolean));

    // const unions = t.unionMembers(C);

    type C = t.Infer<typeof C>;

    const ExcludedA0 = exclude(A, t.number);
    type ExcludedA0 = t.Infer<typeof ExcludedA0>;

    const ExcludedA1 = exclude(A, t.union(t.number, t.boolean));
    type ExcludedA1 = t.Infer<typeof ExcludedA1>;

    const ExcludedB0 = exclude(B, t.string);
    type ExcludedB0 = t.Infer<typeof ExcludedB0>;

    const ExcludedB1 = exclude(B, t.number, t.string);
    type ExcludedB1 = t.Infer<typeof ExcludedB1>;

    const ExcludedC0 = exclude(C, t.string);
    type ExcludedC0 = t.Infer<typeof ExcludedC0>;

    const ExcludedC1 = exclude(C, t.number, t.string);
    type ExcludedC1 = t.Infer<typeof ExcludedC1>;

    const afdafdadf = C.kind;
    // const IntersectedC = intersection(C, t.union(t.string2));
    // const IntersectedC = intersection(C, t.union(t.string2));
    const IntersectedCUnion0 = intersection(C, t.union(t.string));
    type IntersectedCUnion0 = t.Infer<typeof IntersectedCUnion0>;

    const IntersectedCUnion1 = intersection(C, t.string);
    type IntersectedCUnion1 = t.Infer<typeof IntersectedCUnion1>;

    const IntersectedCUnion2 = intersection(C, t.union(t.string, t.number));
    type IntersectedCUnion2 = t.Infer<typeof IntersectedCUnion2>;

    // const afdafdafdadf = IntersectedCUnion0.members[0]!;

    // const foo: A = { children: [{ children: [] }] };

    // expect((A.shape.children.shape as any)[0]).toEqual(t.array(A));

    // type ExpectedAShape = { children?: A[]; self?: A };
    // expectTypesSupportAssignment<ExpectedAShape, A>();
    // expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  // it('nested unions unwrapped', () => {
  //   const A = t.union(t.string2, t.union(t.union(t.number2, t.boolean2), t.string2));
  //   type A = t.Infer<typeof A>;

  //   const Unwrapped = A.unwrap();
  //   type Unwrapped = t.Infer<typeof Unwrapped>;

  //   const foo: A = { children: [{ children: [] }] };

  //   expect((A.shape.children.shape as any)[0]).toEqual(t.array(A));

  //   type ExpectedAShape = { children?: A[]; self?: A };
  //   expectTypesSupportAssignment<ExpectedAShape, A>();
  //   expectTypesSupportAssignment<A, ExpectedAShape>();
  // });
});
