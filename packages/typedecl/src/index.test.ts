/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { type AnyObject } from './generics';
import * as t from './index';
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
    const PersonTwo = t.obj({
      name: t.string,
      age: t.opt(t.number),
      isActive: t.boolean
    });
    const result = PersonTwo.shape.age;
    const name = PersonTwo.shape.age;

    type PersonTwo = t.ToTsType<typeof PersonTwo>;

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

    type ObjB = t.ToTsType<typeof ObjB>;
    type ObjBRoundTripped = t.ToShapeType<ObjB>;

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
    type CircleDefintion = t.ToShapeType<Circle>;

    const Square = t.obj({
      discriminator: t.literal('square' as const),
      width: t.number,
      length: t.number
    });

    type Square = t.ToTsType<typeof Square>;
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

  it.skip('TODO: has smarter recursiveReferences', () => {
    //We define recursive relationship with classes that reference themselves or other classes by setting a property to the referenced class' constructor
    // Starting with the constructor, the following types recursivesly convert all constructors to ObjTypes of their instance type.
    // Note that the topmost constructor is not being returned as an ObjType, so the calling code must use ShapeDefParamsToObjType to finish the process
    // of converting the topmost constructor to an ObjType.

    class Foo {
      self = Foo;
      strProp = t.string;
    }

    type FooShapeDefinition = t.ShapeClassToShapeDefinition<typeof Foo>;
    const fooObject = {} as any as t.ShapeDefinitionToObjType<FooShapeDefinition>;

    type FooObjectType = typeof fooObject;
    type FooTsType = t.ToTsType<FooObjectType>;

    type lkjhjk = FooObjectType['shape'];
    type lself = FooObjectType['shape']['self'];
    type ltype = FooObjectType['shape']['self']['type'];
    type ltypetype = FooObjectType['shape']['self']['type']['shape']['self']['type'];

    type adsfadfladglk = FooTsType['self']['self'];

    const fooObj = t.objFromClass(Foo);

    type afdadsf = typeof fooObj;
    type afdadsasdf = (typeof fooObj)['shape']['self']['type']['shape']['self']['type'];
    type RecType = t.ToTsType<typeof fooObj>;
  });

  describe('Arrays', () => {
    it('allows simple arrays', () => {
      const arrayOfNumbers = t.array(t.number);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(t.string)
      });
      type ObjectWithArray = t.ToTsType<typeof ObjectWithArray>;
      type ObjectWithArrayDefinitionFromShape = t.ToShapeType<ObjectWithArray>;
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
      type ObjectWithArrayDefinitionFromShape = t.ToShapeType<ObjectWithArray>;
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
