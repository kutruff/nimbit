/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { type _type, type AnyObject, type Resolve } from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('obj()', () => {
  it('compiles with round trips between definition and TypeScript types', () => {
    const PersonTwo = t.obj({
      name: t.string,
      age: t.opt(t.number),
      isActive: t.boolean
    });
    type PersonTwo = t.Infer<typeof PersonTwo>;
    const shapeDefintion = {
      name: t.string,
      // age: t.opt(t.number),
      isActive: t.boolean
    };

    const result = PersonTwo.shape.age;
    const name = PersonTwo.shape.age;

    const roundTrippedInstance = {
      kind: 'object',
      shape: {
        name: t.string,
        age: t.opt(t.number),
        isActive: t.boolean
      },
      k: {
        name: 'name',
        age: 'age',
        isActive: 'isActive'
      }
    };

    expect(PersonTwo).toEqual(roundTrippedInstance);
  });

  it('compiles and supports nested objects', () => {
    const ObjA = t.obj({
      name: t.string
    });

    const ObjB = t.obj({
      refToA: ObjA
    });

    type ObjB = t.Infer<typeof ObjB>;
    const objBInstance: ObjB = { refToA: { name: 'hello' } };

    expect(ObjB.shape).toEqual({ refToA: ObjA });
  });

  it('allows mapping of primitive defintions to TypeScript types', () => {
    type strType = typeof t.string;
    type MapPrimitiveStringTest = t.Infer<typeof t.string>;
    type MapPrimitiveNumTest = t.Infer<typeof t.number>;
    type MapPrimitiveBoolTest = t.Infer<typeof t.boolean>;

    type MappedString = t.Infer<t.Type<'string'>>;
    type MappedStringTypeOf = t.Infer<typeof t.string>;
    type MappedNumber = t.Infer<typeof t.number>;
    type MappedBoolean = t.Infer<typeof t.boolean>;

    //type MapPrimitiveObjTestShouldBeNever = t.Shape<typeof t.obj>;
  });

  it('allows mapping of string literals', () => {
    const literal = t.literal('fooLiteral' as const);

    const Circle = t.obj({
      discriminator: t.literal('circle' as const),
      radius: t.number
    });
    type Circle = t.Infer<typeof Circle>;
    const circle: Circle = {
      discriminator: 'circle',
      radius: 21
    };
  });

  it('allows interfaces', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    const Address = t.obj({
      owner: Person
    });

    type Address = t.Infer<typeof Address>;

    expect(Person.shape.name).toEqual(t.string);
    expect(Address.shape.owner).toEqual(Person);
  });

  it('infers correct primitive types', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    type ExpectedPersonType = {
      name: string;
      age: number;
      isActive: boolean;
    };

    type InferredPersonType = t.Infer<typeof Person>;

    const personDeclaredFromInferredType: ExpectedPersonType = {
      name: 'bob',
      age: 1812,
      isActive: false
    };

    const assigned: InferredPersonType = personDeclaredFromInferredType;

    expect(personDeclaredFromInferredType.name).toEqual('bob');
    expect(personDeclaredFromInferredType.age).toEqual(1812);
  });

  it('infers nested types', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean,
      optProp: t.string.opt()
    });

    const Address = t.obj({
      owner: Person
    });

    type Address = t.Infer<typeof Address>;

    type ExpectedPersonType = {
      name: string;
      age: number;
      isActive: boolean;
      optProp?: string;
    };

    type ExpectedAddressType = {
      owner: ExpectedPersonType;
    };

    const person = {
      name: 'bob',
      age: 3252,
      isActive: true
    };

    const addressDeclaredFromInferredType: ExpectedAddressType = {
      owner: person
    };

    const assigned: Address = addressDeclaredFromInferredType;

    expect(addressDeclaredFromInferredType.owner).toEqual({
      name: 'bob',
      isActive: true,
      age: 3252
    });
  });

  it('allows self recursion', () => {
    class ADef {
      self? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const a: A = { self: { self: { self: { self: {} } } } };

    expect(A.shape.self.memberTypes[0]).toEqual(A);

    type ExpectedAShape = { self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });
  1;

  it('allows classes for obj()', () => {
    class ADef {
      prop = t.string;
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    expect(A.shape.prop).toEqual(t.string);

    type ExpectedAShape = { prop: string };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('allows mutual recursion', () => {
    class ADef {
      b? = t.obj(BDef).opt();
      strProp = t.string;
    }

    class BDef {
      a = t.obj(ADef);
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const B = t.obj(BDef);
    type B = t.Infer<typeof B>;

    expect(A.shape.b.memberTypes[0]).toEqual(B);
    expect(B.shape.a).toEqual(A);

    type ExpectedAShape = { b?: B; strProp: string };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();

    type ExpectedBShape = { a: A };
    expectTypesSupportAssignment<ExpectedBShape, B>();
    expectTypesSupportAssignment<B, ExpectedBShape>();
  });

  it('supports self references with arrays', () => {
    class ADef {
      children? = t.array(t.obj(ADef)).opt();
      self? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const foo: A = { children: [{ children: [] }] };

    expect(A.shape.children.memberTypes[0]).toEqual(t.array(A));

    type ExpectedAShape = { children?: A[]; self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('supports self references with tuples', () => {
    class ADef {
      children? = t.tuple([t.obj(ADef), t.obj(ADef)]).opt();
      self? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const exampleAssignment: A = { children: [{}, {}] };

    expect(A.shape.children.memberTypes[0]).toEqual(t.tuple([A, A]));
    type ExpectedAShape = {
      children?: [ExpectedAShape, ExpectedAShape];
      self?: ExpectedAShape;
    };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  describe('property modifiers', () => {
    it('makes optional property defintions into optional TS properties', () => {
      const target = t.obj({ prop: t.opt(t.string) });

      type Target = t.Infer<typeof target>;

      const ExpectedResult = t.obj({
        prop: t.union(t.string, t.undef)
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      type TargetType = typeof target;

      expectTypesSupportAssignment<ExpectedDefinitionType, TargetType>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });

    // it('makes optional readonly property defintions into optional readonly TS properties', () => {
    //   const target = t.obj({ prop: t.optRo(t.string) });

    //   const ExpectedResult = t.obj({
    //     prop: t.union(t.string, t.undef)
    //   });
    //   type ExpectedDefinitionType = typeof ExpectedResult;
    //   expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
    //   expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

    //   type ResultShape = t.Infer<typeof ExpectedResult>;
    //   type ExpectedResultShape = { readonly prop?: string };
    //   expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
    //   expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    // });
  });

  describe('fluent interface', () => {
    it('optN()', () => {
      const target = t.obj({
        propOpt: t.string.opt(),
        propOptN: t.string.optN(),
        propNullish: t.string.nullish(),
        propNullishOpt: t.string.nullish().opt(),
        propComplicatedOpt: t.union(t.string).nullish().opt()
      });
      type Target = t.Infer<typeof target>;
      const ExpectedResult = t.obj({
        propOpt: t.union(t.string, t.undef),
        propOptN: t.union(t.string, t.undef, t.nul),
        propNullish: t.union(t.string, t.undef, t.nul),
        propNullishOpt: t.union(t.string, t.undef, t.nul),
        propComplicatedOpt: t.union(t.string, t.undef, t.nul)
      });
      type ExpectedDefinitionType = typeof ExpectedResult;

      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();
      expect(target).toEqual(ExpectedResult);
    });

    it('handles optional property hierarchies', () => {
      const ObjA = t.obj({
        name: t.string,
        child: t
          .obj({
            childProp: t.string.opt()
          })
          .opt()
      });

      type A = t.Infer<typeof ObjA>;
      interface IA {
        name: string;
        child?: {
          childProp?: string;
        };
      }

      expectTypesSupportAssignment<A, IA>();
      expectTypesSupportAssignment<IA, A>();
    });
  });

  describe('stress tests', () => {
    it('can handle a very complex object hierarchy with optionals', () => {
      const C = t.obj({ prop0: t.boolean, distinctProp: t.number });
      const B = t.obj({ prop0: t.boolean });

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
        propC? = t.opt(C);
      }
      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;

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

      expectTypesSupportAssignment<A, IA>();
      expectTypesSupportAssignment<IA, A>();
    });
  });
});
