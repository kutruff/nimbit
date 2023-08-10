/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { _type, asNumber, asString, boolean, enumm, mapProps, number, obj, string, type Infer, type Resolve } from '.';
import { expectType, expectTypesSupportAssignment, type TypeEqual, type TypeOf } from './test/utilities';

describe('obj()', () => {
  it('compiles with round trips between definition and TypeScript types', () => {
    interface Person {
      name: string;
      age?: number;
      isaActive: boolean;
    }
    const Person = t.obj({
      name: t.string,
      age: t.number.opt(),
      isActive: t.boolean
    });
    type PersonTwo = t.Infer<typeof Person>;
    const shapeDefintion = {
      name: t.string,
      age: t.number.opt(),
      isActive: t.boolean
    };

    const result = Person.shape.age;
    const name = Person.shape.age;

    const roundTrippedInstance = {
      kind: 'object',
      name: undefined,
      propertyPolicy: t.PropertyPolicy.strip,
      [_type]: undefined,
      shape: {
        name: t.string,
        age: t.number.opt(),
        isActive: t.boolean
      }
    };

    //expect(Person).toEqual(Person);
    expect(Person).toMatchObject(roundTrippedInstance);
    expect(Person.k).toEqual({
      name: 'name',
      age: 'age',
      isActive: 'isActive'
    });
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
  describe('functional mapProps()', () => {
    it('remaps properties', () => {
      const target = {
        name: 'hello',
        age: 43,
        sub: {
          one: 'one',
          two: 1n
        },
        title: 'there is no title'
      };
      const result = mapProps(target, {
        name: p => p + ' world',
        age: p => p + 1,
        sub: p => mapProps(p, { one: p => p + 'hello', two: p => p + 1n })
      });
      expect(result).toEqual({
        name: 'hello world',
        age: 44,
        sub: {
          one: 'onehello',
          two: 2n
        },
        title: 'there is no title'
      });
    });
  });

  describe('functional mapPropsPicked()', () => {
    it('remaps properties but omits unmentioned', () => {
      const target = {
        name: 'hello',
        age: 43,
        sub: {
          one: 'one',
          two: 1n
        },
        title: 'there is no title'
      };
      const result = t.mapPropsPicked(target, {
        name: p => p + ' world',
        age: p => p + 1,
        sub: p => mapProps(p, { one: p => p + 'hello', two: p => p + 1n })
      });
      expect(result).toEqual({
        name: 'hello world',
        age: 44,
        sub: {
          one: 'onehello',
          two: 2n
        }
      });
    });
  });

  describe('mapProps()', () => {
    it('supports simple example in documentation ', () => {
      const Person = obj({
        name: string,
        age: number
      });

      //Lets add some validations to Person
      const PersonInput = Person.mapProps({
        name: p => p.opt(), //name is now optional
        age: p => p.where(x => x > 10) // age now must be greater than 10
      });

      PersonInput.parse({ age: 42 }); // { age: 42 }
      PersonInput.parse({ name: 'Bob', age: 42 }); // { name: 'Bob', age: 42 }
      expect(() => PersonInput.parse({ name: 'Bob', age: 9 })).toThrow(); // fail: age must be greater than 10

      type PersonInput = Infer<typeof PersonInput>;
      // {
      //     name?: string | undefined;
      //     age: number;
      // }
    });

    it('supports complicated example in documentation ', () => {
      const Address = obj({ street: string, zipcode: string }); //.where(x => x.length === 5) });

      const Person = obj({
        name: string,
        age: number.where(x => x > 0), //An existing validation
        address: Address,
        isActive: boolean,
        title: string
      });

      const PersonInput = Person.mapProps({
        name: p => p.default(''), //name will default to empty string
        age: p => asNumber.to(p), //age is coerced to a number and then passed to original age and verified > 0
        address: p =>
          p.mapProps({
            street: p => p.where(x => x.includes('St.')), //validate nested property
            zipcode: p => number.to(asString).to(p) //require number but coerce to string and Address will verify length.
          }),
        isActive: p => enumm('state', ['active', 'inactive']).to(p, x => x === 'active') //enum coerced to bool
      });
      type PersonInput = Infer<typeof PersonInput>;
      // type PersonInput = {
      //   name: string;
      //   age: number;
      //   title: string;
      //   address: {
      //       street: string;
      //       zipcode: number;
      //   };
      //   isActive: boolean;
      // }
      // try {

      const result = PersonInput.parse({
        age: '42',
        isActive: 'active',
        title: 'Mr.',
        address: { street: '123 Main St.', zipcode: 10101 }
      });
      // success: true
      // {
      //   name: '',                   // string;
      //   age: 42,                    // number;
      //   title: 'Mr.',               // string;
      //   address: {
      //       street: '123 Main St.', // string;
      //       zipcode: '10101',       // string;
      //   },
      //   isActive: true              // boolean;
      // }

      expect(result).toEqual({
        age: 42,
        name: '',
        title: 'Mr.',
        address: {
          street: '123 Main St.',
          zipcode: '10101'
        },
        isActive: true
      });
    });

    // it('remaps properties', () => {
    //   const Person = obj({
    //     name: string,
    //     age: number.where(x => x > 10),
    //     isActive: boolean,
    //     address: obj({ street: string, city: string }),
    //     title: string
    //   });

    //   const PersonInput = Person.mapProps({
    //     name: p => p.default(''), // name is optional and will default to empty string
    //     age: p => asNumber.to(p), //age is coerced to a number and then passed to original age and verified > 10
    //     isActive: p => enumm('state', ['active', 'inactive']).to(p, x => x === 'active'), // expect enum then coerce to bool
    //     address: p => p.mapProps({ street: p => p.where(x => x === '123 Main St.') }) // nested objects work as well
    //   });

    //   type PersonInput = t.Infer<typeof PersonInput>;
    //   const Expected = obj({
    //     name: string.default(''),
    //     age: number,
    //     isActive: boolean,
    //     address: obj({ street: string, city: string }),
    //     title: Person.shape.title
    //   });

    //   const validParseResult = PersonInput.safeParse({
    //     age: '42',
    //     isActive: 'active',
    //     title: 'Mr.',
    //     address: { street: '123 Main St.', city: 'Anytown' }
    //   });
    //   expect(validParseResult.success).toEqual(true);

    //   expectType<TypeEqual<typeof PersonInput, typeof Expected>>(true);

    //   if (validParseResult.success) {
    //     expect(validParseResult.data).toEqual({
    //       name: '',
    //       age: 42,
    //       isActive: true,
    //       title: 'Mr.',
    //       address: { street: '123 Main St.', city: 'Anytown' }
    //     });
    //   }

    //   const invalidParseResult = PersonInput.safeParse({
    //     name: '',
    //     age: 42,
    //     isActive: 'active',
    //     title: 'Mr.',
    //     address: { street: 'wrong address', city: 'Anytown' }
    //   });
    //   const Person2 = obj({
    //     name: string,
    //     age: number
    //   });

    //   const PersonValidator2 = Person2.mapProps({
    //     name: p => p.opt(), //name is now optional
    //     age: p => p.where(x => x > 10) // age now must be greater than 10
    //   });

    //   PersonValidator2.parse({ age: 42 }); // { age: 42 }
    //   PersonValidator2.parse({ name: 'Bob', age: 42 }); // { name: 'Bob', age: 42 }
    //   expect(PersonValidator2.safeParse({ name: 'Bob', age: 9 }).success).toEqual(false); // fail: age must be greater than 10
    //   type PersonValidator2 = t.Infer<typeof PersonValidator2>;
    //   expect(invalidParseResult.success).toEqual(false);

    //   // The shape is mapped
    //   const PersonInputShape = Person.mapShape({
    //     name: p => boolean
    //   });

    //   //Now to get an object
    //   const PersonInputMapped = obj(PersonInputShape);
    //   type PersonInputMapped = t.Infer<typeof PersonInputMapped>;
    //   const PersonInputShapePicked = Person.mapShapePicked({
    //     name: p => number
    //   });
    //   const PersonInputMapPicked = obj(PersonInputShapePicked);
    //   type PersonInputMapPicked = t.Infer<typeof PersonInputMapPicked>;
    // });
  });

  //   it('supports many types without TypeScript dying', () => {
  //     const A = t.obj({ prop: t.number, propA: t.string, sub: t.obj({ prop: t.number }) });
  //     const B = t.obj({ prop: t.number, propB: t.string, a: A });
  //     const C = t.obj({ prop: t.number, propC: t.string, b: B });
  //     const D = t.obj({ prop: t.number, propD: t.string, c: C });
  //     const E = t.obj({ prop: t.number, propE: t.string, d: D });
  //     const F = t.obj({ prop: t.number, propF: t.string, e: E });
  //     const G = t.obj({ prop: t.number, propG: t.string, f: F });
  //     const H = t.obj({ prop: t.number, propH: t.string, g: G });
  //     const I = t.obj({ prop: t.number, propI: t.string, h: H });

  //     const AB = A.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ a: p }) })
  //     });
  //     const ABC = AB.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ b: p }) })
  //     });
  //     const ABCD = ABC.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ c: p }) })
  //     });
  //     const ABCDE = ABCD.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ d: p }) })
  //     });
  //     const ABCDEF = ABCDE.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ e: p }) })
  //     });
  //     const ABCDEFG = ABCDEF.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ f: p }) })
  //     });
  //     const ABCDEFGH = ABCDEFG.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ g: p }) })
  //     });
  //     const ABCDEFGHI = ABCDEFGH.mapProps({
  //       prop: p => p.tweak(x => x + 1),
  //       sub: p => p.mapProps({ prop: p => obj({ h: p }) })
  //     });

  //     type AB = t.Infer<typeof A>;
  //     type ABC = t.Infer<typeof AB>;
  //     type ABCD = t.Infer<typeof ABCD>;
  //     type ABCDE = t.Infer<typeof ABCDE>;
  //     type ABCDEF = t.Infer<typeof ABCDEF>;
  //     type ABCDEFG = t.Infer<typeof ABCDEFG>;
  //     type ABCDEFGH = t.Infer<typeof ABCDEFGH>;
  //     type ABCDEFGHI = t.Infer<typeof ABCDEFGHI>;

  //     const ABCDEFGH_ABCDEFGHI = ABCDEFGH.merge(ABCDEFGHI);
  //     type ABCDEFGH_ABCDEFGHI = t.Infer<typeof ABCDEFGH_ABCDEFGHI>;
  //     const result: ABCDEFGH_ABCDEFGHI = {} as unknown as ABCDEFGH_ABCDEFGHI;

  //     class RecADef {
  //       recB? = t.obj(RecBDef).opt();
  //       strProp = t.string;
  //       massiveProp = ABCDEFGHI;
  //     }
  //     class RecBDef {
  //       recA = t.obj(RecADef);
  //       a2 = t.flatExcludeKinds(
  //         t.flattenUnion(t.union(t.obj(RecADef), t.union(t.obj(RecBDef), t.undef), t.string)),
  //         t.string
  //       );
  //     }

  //     const RecA = t.obj(RecADef);
  //     type RecA = t.Infer<typeof RecA>;

  //     expect(RecA.shape.recB.kind).toEqual('union');

  //     const RecB = t.obj(RecBDef);
  //     type RecB = t.Infer<typeof RecB>;

  //     const RecA_ABCDEFGH_ABCDEFGHI = RecA.mapProps({ recB: p => p.where(x => x?.recA.strProp === '123') });
  //     type RecA_ABCDEFGH_ABCDEFGHI = t.Infer<typeof RecA_ABCDEFGH_ABCDEFGHI>;

  //     expect(
  //       RecA_ABCDEFGH_ABCDEFGHI.shape.recB.shape[0].shape.recA.shape.massiveProp.shape.sub.shape.prop.shape.h.shape.g
  //         .shape.f.shape.e.shape.d.shape.c.shape.b.shape.a.kind
  //     ).toEqual('number');
  //   });
  // });

  // describe('mapPropsPicked()', () => {
  //   it('remaps properties and removes unpicked properties', () => {
  //     const Person = obj({
  //       name: string,
  //       age: number,
  //       isActive: boolean,
  //       address: obj({ street: string, city: string }),
  //       title: string
  //     });

  //     const Result = Person.mapPropsPicked({
  //       name: p => p.opt(),
  //       age: p => p.to(asString),
  //       isActive: p => p.where(x => x === true),
  //       address: p => p.mapProps({ street: p => p.where(x => x === '123 Main St.') })
  //     });

  //     type Result = t.Infer<typeof Result>;
  //     const Expected = obj({
  //       name: string.opt(),
  //       age: number.to(asString),
  //       isActive: boolean.where(x => x === true),
  //       address: obj({ street: string.where(x => x === '123 Main St.'), city: string })
  //     });

  //     expectType<TypeEqual<typeof Result, typeof Expected>>(true);

  //     const validParseResult = Result.safeParse({
  //       name: undefined,
  //       age: 42,
  //       isActive: true,
  //       title: 'Mr.',
  //       address: { street: '123 Main St.', city: 'Anytown' }
  //     });
  //     expect(validParseResult.success).toEqual(true);

  //     if (validParseResult.success) {
  //       expect(validParseResult.data).toEqual({
  //         name: undefined,
  //         age: '42',
  //         isActive: true,
  //         title: undefined,
  //         address: { street: '123 Main St.', city: 'Anytown' }
  //       });
  //     }
  //   });
  // });

  it('allows self recursion', () => {
    class ADef {
      self? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;

    const a: A = { self: { self: { self: { self: {} } } } };

    expect(A.shape.self.members[0]).toEqual(A);

    type ExpectedAShape = { self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();

    const result = A.strict().parse({ self: { self: {} } });
  });

  it('recursive category example', () => {
    class CategoryDef {
      name = t.string;
      subcategories = t.array(t.obj(CategoryDef));
    }
    const Category = t.obj(CategoryDef);
    type Category = t.Infer<typeof Category>;

    const result = Category.safeParse({
      name: 'People',
      subcategories: [
        {
          name: 'Politicians',
          subcategories: [
            {
              name: 'Presidents',
              subcategories: []
            }
          ]
        }
      ]
    }); // passes

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.data.subcategories[0]?.subcategories[0]?.name).toEqual('Presidents');
    }
  });

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

  it.failing('allows mutual recursion with circular references', () => {
    //TODO: need to allow circular references
    class PersonDef {
      name = t.string;
      addresses? = t.array(t.obj(AddressDef)).opt();
    }

    class AddressDef {
      resident? = t.obj(PersonDef).opt();
      street = t.string;
    }

    const Person = t.obj(PersonDef);
    type Person = t.Infer<typeof Person>;

    const Address = t.obj(AddressDef);
    type Address = t.Infer<typeof Address>;

    const bob: Person = {
      name: 'Bob',
      addresses: [
        {
          resident: { name: 'Bob' },
          street: '123 Main St.'
        }
      ]
    };

    const someAddress: Address = {
      resident: { name: 'Bob' },
      street: '123 Main St.'
    };

    const circularAddress = { ...someAddress };
    const bobCopy = { ...bob };
    circularAddress.resident = bobCopy;
    bobCopy.addresses = [circularAddress];

    const result = Person.safeParse(bobCopy); // passes
    expect(result.success).toEqual(true);
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

    expect(A.shape.b.members[0]).toEqual(B);
    expect(B.shape.a).toEqual(A);

    type ExpectedAShape = { b?: B; strProp: string };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();

    type ExpectedBShape = { a: A };
    expectTypesSupportAssignment<ExpectedBShape, B>();
    expectTypesSupportAssignment<B, ExpectedBShape>();
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

    expect(A.shape.b.members[0]).toEqual(B);
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

    expect(A.shape.children.members[0]).toEqual(t.array(A));

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

    expect(A.shape.children.members[0]).toEqual(t.tuple([A, A]));
    type ExpectedAShape = {
      children?: [ExpectedAShape, ExpectedAShape];
      self?: ExpectedAShape;
    };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  describe('property modifiers', () => {
    it('makes optional property definitions into optional TS properties', () => {
      const target = t.obj({ prop: t.string.opt() });

      type Target = t.Infer<typeof target>;

      const ExpectedResult = t.obj({
        prop: t.union(t.string, t.undef)
      });

      type ExpectedDefinitionType = typeof ExpectedResult;
      type TargetType = typeof target;

      expectTypesSupportAssignment<ExpectedDefinitionType, TargetType>();
      // expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      type ResultShape = t.Infer<typeof ExpectedResult>;
      type ExpectedResultShape = { readonly prop?: string };
      expectTypesSupportAssignment<ExpectedResultShape, ResultShape>();
      expectTypesSupportAssignment<ResultShape, ExpectedResultShape>();
    });

    // it('makes optional readonly property defintions into optional readonly TS properties', () => {
    //   const target = t.obj({ prop: t.opt()Ro(t.string) });

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
        propNullish: t.string.nullish(),
        propNullishOpt: t.string.nullish().opt(),
        propComplicatedOpt: t.union(t.string).nullish().opt()
      });
      type Target = t.Infer<typeof target>;
      const ExpectedResult = t.obj({
        propOpt: t.union(t.string, t.undef),
        propNullish: t.union(t.string, t.undef, t.nul),
        propNullishOpt: t.union(t.union(t.string, t.undef, t.nul), t.undef),
        propComplicatedOpt: t.union(t.union(t.union(t.string), t.undef, t.nul), t.undef)
      });
      type ExpectedDefinitionType = typeof ExpectedResult;

      // expectType<TypeEqual<typeof target, ExpectedDefinitionType>>(true);

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
  describe('default()', () => {
    it('returns default when undefined', () => {
      const target = t.string.default('hello');
      const result = target.safeParse(undefined);

      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual('hello');
      }
    });

    it('returns parsed value when not undefined', () => {
      const target = t.string.default('world');
      const result = target.safeParse('hello');

      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual('hello');
      }
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
        propC? = C.opt();
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
