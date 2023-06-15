/* eslint-disable @typescript-eslint/no-unused-vars */
import { type AnyObject } from './generics';
import * as t from './index';
import { ShapeKeys } from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Type declaration', () => {
  const Person = t.obj({
    name: t.string,
    age: t.number,
    isActive: t.boolean
  });

  const Address = t.obj({
    owner: Person
  });

  type Address = t.ToTsType<typeof Address>;

  it('compiles with round trips between definition and TypeScript types', () => {
    const PersonTwo = t.obj(
      {
        name: t.string,
        age: t.opt(t.number),
        isActive: t.boolean
      },
      'PersonTwo'
    );
    const result = PersonTwo.shape.age;
    const name = PersonTwo.shape.age;

    type PersonTwo = t.ToTsType<typeof PersonTwo>;

    type PersonTwoShapeDefinitionRoundTripped = t.ToDefinitionType<PersonTwo>;

    const roundTrippedInstance: PersonTwoShapeDefinitionRoundTripped = {
      kind: 'object',
      name: 'PersonTwo',
      shape: {
        name: { ...t.prop(t.string), name: 'name' },
        age: { ...t.opt(t.number), name: 'age' },
        isActive: { ...t.prop(t.boolean), name: 'isActive' }
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

    type ObjB = t.ToTsType<typeof ObjB>;
    type ObjBRoundTripped = t.ToDefinitionType<ObjB>;

    const objBInstance: ObjB = { refToA: { name: 'hello' } };
    const testFoo: ObjBRoundTripped = ObjB;
    const testReverse: typeof ObjB = {} as unknown as ObjBRoundTripped;
  });

  it('allows mapping of primitive defintions to TypeScript types', () => {
    type strType = typeof t.string;
    type MapPrimitiveStringTest = t.ToTsType<typeof t.string>;
    type MapPrimitiveNumTest = t.ToTsType<typeof t.number>;
    type MapPrimitiveBoolTest = t.ToTsType<typeof t.boolean>;

    type MappedString = t.ToTsType<t.Type<'string'>>;
    type MappedStringTypeOf = t.ToTsType<typeof t.string>;
    type MappedNumber = t.ToTsType<typeof t.number>;
    type MappedBoolean = t.ToTsType<typeof t.boolean>;

    //type MapPrimitiveObjTestShouldBeNever = t.Shape<typeof t.obj>;
  });

  it('allows mapping of string literals', () => {
    const literal = t.literal('fooLiteral' as const);

    const Circle = t.obj({
      discriminator: t.literal('circle' as const),
      radius: t.number
    });
    type Circle = t.ToTsType<typeof Circle>;
    type CircleDefintion = t.ToDefinitionType<Circle>;

    const Square = t.obj({
      discriminator: t.literal('square' as const),
      width: t.number,
      length: t.number
    });

    type Square = t.ToTsType<typeof Square>;
  });

  it('allows mapping of TypeScript types to primitive defintions', () => {
    type strType = typeof t.string;
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
    expect(Person.shape.name.type).toEqual(t.string);
    expect(Address.shape.owner.type).toEqual(Person);
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

  const recursiveRef = Symbol('recursiveRef');

  it('has smarter recursiveReferences', () => {
    const recRefType = t.createType<'recursiveRef', 'A'>('recursiveRef');

    const table0Unlinked = t.obj(
      {
        name: t.string,
        self: recRefType
      },
      'table0'
    );

    type RemapRecs<T, TRef, TTarget> = {
      [P in keyof T]: T[P] extends t.Prop<infer T, unknown, infer R, infer TKey extends P>
        ? t.Prop<T, true, R, TKey>
        : never;
    };

    type fadfad = (typeof table0Unlinked)['shape']['self']['type'];
    type res = (typeof table0Unlinked)['shape']['self'] extends typeof recRefType ? true : false;
    function linkRecRefs<TShapeDefinitionA extends t.ShapeDefinition, TShapeDefinitionB extends t.ShapeDefinition>(
      objectTypeA: t.ObjType<TShapeDefinitionA>,
      objectTypeB: t.ObjType<TShapeDefinitionB>
    ): {
      [K in keyof TShapeDefinitionA]: TShapeDefinitionA[K]['type'] extends typeof recRefType
        ? typeof objectTypeB
        : TShapeDefinitionA[K];
    } {
      type LinkedType = {
        [K in keyof TShapeDefinitionA]: TShapeDefinitionA[K]['type'] extends typeof recRefType
          ? typeof objectTypeB
          : TShapeDefinitionA[K];
      };

      return {} as unknown as {
        [K in keyof TShapeDefinitionA]: TShapeDefinitionA[K]['type'] extends typeof recRefType
          ? typeof objectTypeB
          : TShapeDefinitionA[K];
      };
    }

    const table0 = linkRecRefs(table0Unlinked, table0Unlinked);

    interface SelfReferencing {
      child: SelfReferencing;
    }

    const SelfReferencing = t.declareObj<SelfReferencing>();
    t.defineDeclaration(SelfReferencing, {
      child: SelfReferencing
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
      barProp: t.string,
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
      const arrayOfNumbers = t.array(t.number);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(t.string)
      });
      type ObjectWithArray = t.ToTsType<typeof ObjectWithArray>;
      type ObjectWithArrayDefinitionFromShape = t.ToDefinitionType<ObjectWithArray>;
      const instance: ObjectWithArray = {
        anArrayProp: ['foo', 'bar']
      };
    });

    it('allows arrays of objects', () => {
      const arrayOfNumbers = t.array(t.number);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(
          t.obj({
            someProp: t.string
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
      const target = t.obj({ prop: t.opt(t.string) });

      const ExpectedResult = t.obj({
        prop: { type: t.string, attributes: { isOptional: true as const, isReadonly: false as const } }
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
      const target = t.obj({ prop: t.ro(t.string) });

      const ExpectedResult = t.obj({
        prop: { type: t.string, attributes: { isOptional: false as const, isReadonly: true as const } }
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
      const target = t.obj({ prop: t.optRo(t.string) });

      const ExpectedResult = t.obj({
        prop: { type: t.string, attributes: { isOptional: true as const, isReadonly: true as const } }
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
