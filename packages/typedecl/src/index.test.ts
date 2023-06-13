/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jest/expect-expect */
import { AnyObject } from './generics';
import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Type declaration', () => {
  const Person = t.obj({
    name: t.str,
    age: t.num,
    isActive: t.bool
  });

  const Address = t.obj({
    owner: Person
  });

  type Address = t.ToTsType<typeof Address>;

  it('compiles with round trips between definition and TypeScript types', () => {
    const PersonTwo = t.obj({
      name: t.str,
      age: t.optProp(t.num),
      isActive: t.bool
    });
    const result = PersonTwo.objectDefinition.age;
    const name = PersonTwo.objectDefinition.age;

    type PersonTwo = t.ToTsType<typeof PersonTwo>;

    type PersonTwoShapeDefinitionRoundTripped = t.ToDefinitionType<PersonTwo>;

    const roundTrippedInstance: PersonTwoShapeDefinitionRoundTripped = {
      kind: 'object',
      objectDefinition: {
        name: t.prop(t.str),
        age: t.optProp(t.num),
        isActive: t.prop(t.bool)
      }
    };

    expect(PersonTwo).toEqual(roundTrippedInstance);
  });

  it('compiles and supports nested objects', () => {
    const ObjA = t.obj({
      name: t.str
    });

    const ObjB = t.obj({
      refToA: ObjA
    });

    type ObjB = t.ToTsType<typeof ObjB>;
    type ObjBRoundTripped = t.ToDefinitionType<ObjB>;

    const objBInstance: ObjB = { refToA: { name: 'hello' } };
    const testFoo: ObjBRoundTripped = ObjB;
    const testReverse: typeof ObjB = {} as any as ObjBRoundTripped;
  });

  it('allows mapping of primitive defintions to TypeScript types', () => {
    type strType = typeof t.str;
    type MapPrimitiveStringTest = t.ToTsType<typeof t.str>;
    type MapPrimitiveNumTest = t.ToTsType<typeof t.num>;
    type MapPrimitiveBoolTest = t.ToTsType<typeof t.bool>;

    type MappedString = t.ToTsType<t.Type<'string'>>;
    type MappedStringTypeOf = t.ToTsType<typeof t.str>;
    type MappedNumber = t.ToTsType<typeof t.num>;
    type MappedBoolean = t.ToTsType<typeof t.bool>;

    //type MapPrimitiveObjTestShouldBeNever = t.Shape<typeof t.obj>;
  });

  it('allows mapping of string literals', () => {
    const literal = t.literal('fooLiteral' as const);

    const Circle = t.obj({
      discriminator: t.literal('circle' as const),
      radius: t.num
    });
    type Circle = t.ToTsType<typeof Circle>;
    type CircleDefintion = t.ToDefinitionType<Circle>;

    const Square = t.obj({
      discriminator: t.literal('square' as const),
      width: t.num,
      length: t.num
    });

    type Square = t.ToTsType<typeof Square>;
  });

  it('allows mapping of TypeScript types to primitive defintions', () => {
    type strType = typeof t.str;
    type MapPrimitiveStringTest = t.ToDefinitionType<string>;
    type MapPrimitiveNumTest = t.ToDefinitionType<number>;
    type MapPrimitiveObjTest = t.ToDefinitionType<AnyObject>;

    type MappedString = t.ToDefinitionType<string>;
    type MappedNumber = t.ToDefinitionType<number>;

    type MappedLiteral = t.ToDefinitionType<'fooLiteral'>;

    type MappedObj = t.ToDefinitionType<{
      name: string;
      age: number;
      aLiteral: 'someLiteral';
      address: {
        street: string;
      };
    }>;
    type MappedObjShape = t.ToTsType<MappedObj>;
  });

  it('allows interfaces', () => {
    expect(Person.objectDefinition.name.type).toEqual(t.str);
    expect(Address.objectDefinition.owner.type).toEqual(Person);
  });

  it('infers correct primitive types', () => {
    type ExpectedPersonType = {
      name: string;
      age: number;
      isActive: boolean;
    };

    type InferredPersonType = t.ToTsType<typeof Person>;

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
    type ExpectedPersonType = {
      name: string;
      age: number;
      isActive: boolean;
    };

    type ExpectedAddressType = {
      owner: ExpectedPersonType;
    };

    type InferredShapeType = t.ToTsType<typeof Address>;

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

  it('infers recursively', () => {
    interface SelfReferencing {
      child: SelfReferencing;
    }

    const SelfReferencing = t.declareObj<SelfReferencing>();
    t.defineDeclaration(SelfReferencing, {
      child: SelfReferencing
    });
  });

  it('recursive comparison is okay', () => {
    interface SelfReferencingA {
      child: SelfReferencingB;
    }

    interface SelfReferencingB {
      child: SelfReferencingA;
    }

    const SelfReferencingA = t.declareObj<SelfReferencingA>();
    const SelfReferencingB = t.declareObj<SelfReferencingB>();

    t.defineDeclaration(SelfReferencingA, {
      child: SelfReferencingB
    });

    t.defineDeclaration(SelfReferencingB, {
      child: SelfReferencingA
    });

    type InferredSelfReferencingAType = t.ToTsType<typeof SelfReferencingA>;
    const aInstance = {} as InferredSelfReferencingAType;

    type InferredSelfReferencingBType = t.ToTsType<typeof SelfReferencingB>;
  });

  it('mutally recursive', () => {
    interface Bar {
      barProp: string;
      foo: Foo;
    }

    interface Foo {
      bar: Bar;
    }

    const Bar = t.declareObj<Bar>();

    const Foo = t.obj({
      bar: Bar
    });

    t.defineDeclaration(Bar, {
      barProp: t.str,
      foo: Foo
    });

    const fooInstance = {} as t.ToTsType<typeof Foo>;

    const barInstance: t.ToTsType<typeof Bar> = {
      barProp: 'something',
      foo: fooInstance
    };

    fooInstance.bar = barInstance;
  });

  describe('Arrays', () => {
    it('allows simple arrays', () => {
      const arrayOfNumbers = t.array(t.num);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(t.str)
      });
      type ObjectWithArray = t.ToTsType<typeof ObjectWithArray>;
      type ObjectWithArrayDefinitionFromShape = t.ToDefinitionType<ObjectWithArray>;
      const instance: ObjectWithArray = {
        anArrayProp: ['foo', 'bar']
      };
    });

    it('allows arrays of objects', () => {
      const arrayOfNumbers = t.array(t.num);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(
          t.obj({
            someProp: t.str
          })
        )
      });
      type ObjectWithArray = t.ToTsType<typeof ObjectWithArray>;
      type ObjectWithArrayDefinitionFromShape = t.ToDefinitionType<ObjectWithArray>;
      const instance: ObjectWithArray = {
        anArrayProp: [{ someProp: 'foo' }, { someProp: 'bar' }]
      };
    });
  });

  describe('property modifiers', () => {
    it('makes optional property defintions into optional TS properties', () => {
      const target = t.obj({ prop: t.optProp(t.str) });

      const ExpectedResult = t.obj({
        prop: { type: t.str, attributes: { isOptional: true as const, isReadonly: false as const } }
      });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });

    it('makes readonly property defintions into readonly TS properties', () => {
      const target = t.obj({ prop: t.roProp(t.str) });

      const ExpectedResult = t.obj({
        prop: { type: t.str, attributes: { isOptional: false as const, isReadonly: true as const } }
      });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });

    it('makes optional readonly property defintions into optional readonly TS properties', () => {
      const target = t.obj({ prop: t.optRoProp(t.str) });

      const ExpectedResult = t.obj({
        prop: { type: t.str, attributes: { isOptional: true as const, isReadonly: true as const } }
      });
      type ExpectedDefinitionType = typeof ExpectedResult;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.ToTsType<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });
  });
});
