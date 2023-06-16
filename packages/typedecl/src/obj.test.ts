/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { type AnyObject } from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('obj()', () => {
  it('compiles with round trips between definition and TypeScript types', () => {
    const PersonTwo = t.obj({
      name: t.string,
      age: t.opt(t.number),
      isActive: t.boolean
    });
    const result = PersonTwo.shape.age;
    const name = PersonTwo.shape.age;

    type PersonTwo = t.Infer<typeof PersonTwo>;

    type PersonTwoShapeRoundTripped = t.ToShapeType<PersonTwo>;

    const roundTrippedInstance: PersonTwoShapeRoundTripped = {
      kind: 'object',
      shape: {
        name: { ...t.prop(t.string) },
        age: { ...t.opt(t.number) },
        isActive: { ...t.prop(t.boolean) }
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
    type ObjBRoundTripped = t.ToShapeType<ObjB>;

    const objBInstance: ObjB = { refToA: { name: 'hello' } };
    const testFoo: ObjBRoundTripped = ObjB;
    const testReverse: typeof ObjB = {} as unknown as ObjBRoundTripped;
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
    type CircleDefintion = t.ToShapeType<Circle>;

    const Square = t.obj({
      discriminator: t.literal('square' as const),
      width: t.number,
      length: t.number
    });

    type Square = t.Infer<typeof Square>;
  });

  it('allows mapping of TypeScript types to primitive defintions', () => {
    type strType = typeof t.string;
    type MapPrimitiveStringTest = t.ToShapeType<string>;
    type MapPrimitiveNumTest = t.ToShapeType<number>;
    type MapPrimitiveObjTest = t.ToShapeType<AnyObject>;

    type MappedString = t.ToShapeType<string>;
    type MappedNumber = t.ToShapeType<number>;

    type MappedLiteral = t.ToShapeType<'fooLiteral'>;

    type MappedObj = t.ToShapeType<{
      name: string;
      age: number;
      aLiteral: 'someLiteral';
      address: {
        street: string;
      };
    }>;
    type MappedObjShape = t.Infer<MappedObj>;
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

    expect(Person.shape.name.type).toEqual(t.string);
    expect(Address.shape.owner.type).toEqual(Person);
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
      isActive: t.boolean
    });

    const Address = t.obj({
      owner: Person
    });

    type Address = t.Infer<typeof Address>;

    type ExpectedPersonType = {
      name: string;
      age: number;
      isActive: boolean;
    };

    type ExpectedAddressType = {
      owner: ExpectedPersonType;
    };

    type InferredShapeType = t.Infer<typeof Address>;

    const person = {
      name: 'bob',
      age: 3252,
      isActive: true
    };

    const addressDeclaredFromInferredType: ExpectedAddressType = {
      owner: person
    };

    const assigned: InferredShapeType = addressDeclaredFromInferredType;

    expect(addressDeclaredFromInferredType.owner).toEqual({
      name: 'bob',
      isActive: true,
      age: 3252
    });
  });

  it('allows self recursion', () => {
    class ADef {
      self = ADef;
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    expect(A.shape.self.type).toEqual(A);

    type ExpectedAShape = { self: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('allows obj()', () => {
    class ADef {
      prop = t.string;
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    expect(A.shape.prop.type).toEqual(t.string);

    type ExpectedAShape = { prop: string };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('allows mutual recursion', () => {
    class ADef {
      b = BDef;
    }

    class BDef {
      a = ADef;
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const B = t.obj(BDef);
    type B = t.Infer<typeof B>;

    expect(A.shape.b.type).toEqual(B);
    expect(B.shape.a.type).toEqual(A);

    type ExpectedAShape = { b: B };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();

    type ExpectedBShape = { a: A };
    expectTypesSupportAssignment<ExpectedBShape, B>();
    expectTypesSupportAssignment<B, ExpectedBShape>();
  });

  it('supports self references with arrays', () => {
    class ADef {
      children = t.array(t.obj(ADef));
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    expect(A.shape.children.type.elementType).toEqual(A);

    type ExpectedAShape = { children: A[] };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  describe('property modifiers', () => {
    it('makes optional property defintions into optional TS properties', () => {
      const target = t.obj({ prop: t.opt(t.string) });

      const ExpectedResult = t.obj({
        prop: { type: t.string, attributes: { isOptional: true as const, isReadonly: false as const } }
      });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });

    it('makes readonly property defintions into readonly TS properties', () => {
      const target = t.obj({ prop: t.ro(t.string) });

      const ExpectedResult = t.obj({
        prop: { type: t.string, attributes: { isOptional: false as const, isReadonly: true as const } }
      });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });

    it('makes optional readonly property defintions into optional readonly TS properties', () => {
      const target = t.obj({ prop: t.optRo(t.string) });

      const ExpectedResult = t.obj({
        prop: { type: t.string, attributes: { isOptional: true as const, isReadonly: true as const } }
      });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
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
        propC = t.opt(C);
      }
      const A = t.obj(ADef);

      type ACons = typeof A;
      type A = t.Infer<ACons>;
      type ARoundTrip = t.ToShapeType<A>;

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

      expectTypesSupportAssignment<ACons, ARoundTrip>();
      expectTypesSupportAssignment<ARoundTrip, ACons>();
      expectTypesSupportAssignment<A, IA>();
      expectTypesSupportAssignment<IA, A>();
    });
  });
});
