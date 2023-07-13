/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as t from '.';
import { pass } from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('TypeConverter', () => {
  it('parses', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    type Person = t.Infer<typeof Person>;
    const result = Person.parse({ name: 'John', age: 10, isActive: true });

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.value).toEqual({ name: 'John', age: 10, isActive: true });
    }
  });

  describe('strict parsing', () => {
    it('parses objects strict when told to', () => {
      const Person = t.obj(
        {
          name: t.string,
          age: t.number,
          isActive: t.boolean
        },
        'Person',
        true
      );

      const result = Person.parse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

      expect(result.success).toEqual(true);

      if (result.success) {
        expect(result.value).toEqual({ name: 'John', age: 10, isActive: true });
        expect((result.value as any).extraProperty).toEqual(undefined);
      }
    });

    it('parses objects strict', () => {
      const Person = t.obj({
        name: t.string,
        age: t.number,
        isActive: t.boolean
      });

      const result = Person.parse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any, {
        strict: true
      });

      expect(result.success).toEqual(true);

      if (result.success) {
        expect(result.value).toEqual({ name: 'John', age: 10, isActive: true });
        expect((result.value as any).extraProperty).toEqual(undefined);
      }
    });

    it('parses objects strict when default set', () => {
      const originalOptions = t.Typ.defaultOpts;
      try {
        t.Typ.defaultOpts = { strict: true };

        const Person = t.obj(
          {
            name: t.string,
            age: t.number,
            isActive: t.boolean
          },
          'Person'
        );

        const result = Person.parse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

        expect(result.success).toEqual(true);

        if (result.success) {
          expect(result.value).toEqual({ name: 'John', age: 10, isActive: true });
          expect((result.value as any).extraProperty).toEqual(undefined);
        }
      } finally {
        t.Typ.defaultOpts = originalOptions;
      }
    });
  });

  it('supports where', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number.where(x => x > 21),
      isActive: t.boolean
    });

    type Person = t.Infer<typeof Person>;
    const result = Person.parse({ name: 'John', age: 10, isActive: true });

    expect(result.success).toEqual(false);

    const PersonOver = t.obj({
      name: t.string,
      age: t.number.where(x => x >= 21),
      isActive: t.boolean
    });

    type PersonOver = t.Infer<typeof PersonOver>;
    const resultOver = PersonOver.parse({ name: 'Bob', age: 21, isActive: true });

    expect(resultOver.success).toEqual(true);
    if (resultOver.success) {
      expect(resultOver.value).toEqual({ name: 'Bob', age: 21, isActive: true });
    }
  });

  function parseNumber(x: unknown) {
    const result = Number(x);
    return !isNaN(result) ? t.pass(result) : t.fail();
  }

  // it('from() works', () => {
  //   const target = t.number.from(parseNumber);

  //   const result = target.parse('2123');
  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual(2123);
  //   }
  // });

  // it('from() is a chain of from in right to left', () => {
  //   const target = t.number
  //     .from(x => {
  //       const result = 2 * Number(x);
  //       return toParseResult(result, !isNaN(result));
  //     })
  //     .from(x => {
  //       const result = Number(x) + 1;
  //       return toParseResult(result, !isNaN(result));
  //     });

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual(50);
  //   }
  // });

  it('supports to', () => {
    const target = t.string.to(t.number, parseNumber);

    const result = target.parse('24');

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(24);
    }
  });

  // it('supports to as method', () => {
  //   const target = t.string.to(x => ({ success: true, value: x + 'hello' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24hello');
  //   }
  // });

  // it('to() chains left to right', () => {
  //   const target = t.string
  //     .to(x => ({ success: true, value: x + 'hello' }))
  //     .to(x => ({ success: true, value: x + 'there' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24hellothere');
  //   }
  // });

  // it('from() first then to() chains', () => {
  //   // const target = t
  //   //   .from(
  //   //     t
  //   //       .from(t.string, t.string, x => ({ success: true, value: x + 'from1' }))
  //   //       .to(x => ({ success: true, value: x + 'to1 ' })),
  //   //     t.string,
  //   //     x => ({ success: true, value: x + 'from2' })
  //   //   )
  //   //   .to(x => ({ success: true, value: x + 'to2 ' }));

  //   const target = t
  //     .feed(x => ({ success: true, value: x + 'from2' }), t.string)

  //     .to(x => ({ success: true, value: x + 'to2 ' }));

  //   // .to(x => ({ success: true, value: x + 'to2 ' }))
  //   // .from(x => ({ success: true, value: x + 'from1 ' }))
  //   // .to(x => ({ success: true, value: x + 'to3 ' }))
  //   // .from(x => ({ success: true, value: x + 'from2 ' }))
  //   // .to(x => ({ success: true, value: x + 'to4 ' }))
  //   // .from(x => ({ success: true, value: x + 'from3 ' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24from3 from2 from1 to1 to2 to3 to4 ');
  //   }
  // });

  // it('from() first then to() chains', () => {
  //   const target = t.string
  //     .to(x => ({ success: true, value: x + 'to1 ' }))
  //     .to(x => ({ success: true, value: x + 'to2 ' }))
  //     .from(x => ({ success: true, value: x + 'from1 ' }))
  //     .to(x => ({ success: true, value: x + 'to3 ' }))
  //     .from(x => ({ success: true, value: x + 'from2 ' }))
  //     .to(x => ({ success: true, value: x + 'to4 ' }))
  //     .from(x => ({ success: true, value: x + 'from3 ' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24from3 from2 from1 to1 to2 to3 to4 ');
  //   }
  // });

  // it('complex chain', () => {
  //   const target = t.string
  //     // .to(x => ({ success: true, value: x + 'to1 ' }))
  //     // .to(x => ({ success: true, value: x + 'to2 ' }))
  //     // .from(x => ({ success: true, value: x + 'from1 ' }))
  //     // .to(x => ({ success: true, value: x + 'to3 ' }))
  //     // .from(x => ({ success: true, value: x + 'from2 ' }))
  //     .to(t.number, parseNumber)
  //     .from(x => {
  //       console.log(x, typeof x);
  //       return { success: true, value: x as string };
  //     });

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24from3 from2 from1 to1 to2 to3 to4 ');
  //   }
  // });

  const coerceToDate = (x: string | number | Date) => {
    const result = new Date(x);
    return !isNaN(result.getTime()) ? t.pass(result) : t.fail();
  };

  it('to() makes datelike easy', () => {
    const DateLike = t.union(t.number, t.string, t.date).to(t.date, coerceToDate);

    type foo = (typeof DateLike)['kind'];
    type DateLike = t.Infer<typeof DateLike>;
    const assigned: DateLike = new Date();
    const result = DateLike.parse(1232131);
    if (result.success) {
      expect(result.value).toEqual(new Date(1232131));
    }
    type adfdaf = Date extends object ? true : false;
    type adfdaf2 = Int16Array extends object ? true : false;

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(new Date(1232131));
    }
  });

  it('to() basic objects', () => {
    const Source = t.obj({ prop: t.string });
    const target = Source.to(t.obj({ prop: t.number }), x => pass({ prop: Number(x.prop) }));
    const result = target.parse({ prop: '1243' });

    const EnumTest = t.enumm('EnumTest', ['a', 'b', 'c']);
    const enumResult = EnumTest.parse('a');
    const enumToString = EnumTest.to(t.string, x => t.pass(x));
    type enumToString = t.Infer<typeof enumToString>;

    const stringResult = t.string.parse('hello');

    const ArrayTest = t.array(t.number);
    type ArrayTest = t.Infer<typeof ArrayTest>;
    const arrayResult = ArrayTest.parse([1, 2, 3]);

    const arrayToString = ArrayTest.to(t.string, x => t.pass(x.join(',')));
    type arrayToString = t.Infer<typeof arrayToString>;
    const arrayToStringResult = arrayToString.parse([1, 2, 3]);

    const stringToArray = t.string.to(ArrayTest, x => t.pass([Number(x)]));
    type stringToArray = t.Infer<typeof stringToArray>;
    const stringToArrayResult = stringToArray.parse('1,2,3');

    const stringToNumber = t.string.to(t.number, x => t.pass(Number(x)));
    stringToNumber.parse('123');
    // type ArrayTestWithInput = ReturnType<typeof ArrayTest._withInput<string>>;
    // type ArrayTestParseType = ArrayTestWithInput['parse'];

    const unionTest = t.union(t.string, t.number);
    type unionTest = t.Infer<typeof unionTest>;
    const unionTestResult = unionTest.parse('123');

    const unionToString = unionTest.to(t.string, x => t.pass(x as string));
    type unionToString = t.Infer<typeof unionToString>;
    const unionToStringResult = unionToString.parse('123');

    const singleStringUnion = t.union(t.string, t.number);

    const opted = singleStringUnion.opt();

    const stringToUnion = t.string.to(singleStringUnion);
    type stringToUnion = t.Infer<typeof stringToUnion>;
    const stringToUnionResult = stringToUnion.parse('123');

    const unionedAgain = t.union(stringToUnion, t.number);

    type isUnion = (typeof unionedAgain)['memberTypes'];

    const tupleTest = t
      .tuple([t.string, t.string])
      .to(t.tuple([t.string, t.number]), x => pass(t.asTuple(x[0], Number(x[1]))));
    const resultTuple = tupleTest.parse(['hello', '123']);
    if (resultTuple.success) {
      resultTuple.value;
    }

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value.prop).toEqual(1243);
    }
  });

  it('to() stress test', () => {
    class ADef {
      self? = t.obj(ADef).opt();
      literalProp = t.literal('hello').to(t.literal('world'), x => pass('world' as const));
      tupleProp = t
        .tuple([t.string, t.string])
        .to(t.tuple([t.string, t.number]), x => pass(t.asTuple(x[0], Number(x[1]))));
    }

    const literalTest = t.literal('hello').to(t.literal('world'), x => pass('world' as const));
    const result = literalTest.parse('hello');
    if (result.success) {
      result.value;
    }
    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;
    const target = A.to(t.obj({ prop: A }), x => pass({ prop: x }));

    type adfadgagdag = t.Infer<typeof target>;
    const result2 = target.parse({
      literalProp: 'world',
      tupleProp: ['myString', 123],
      self: { literalProp: 'world', tupleProp: ['someString', 2354] }
    });

    if (result2.success) {
      result2.value.prop;
      expect(result2.value.prop.self?.tupleProp[1]).toEqual(2354);
    }
    // const a: A = { self: {literalProp: 'world', } } } };

    expect(A.shape.self.memberTypes[0]).toEqual(A);
  });

  it('to() allows self recursion', () => {
    class ADef {
      self? = t.obj(ADef).opt();
    }

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;
    const target = A.to(t.obj({ prop: A }), x => pass({ prop: x }));

    type adfadgagdag = t.Infer<typeof target>;
    const result2 = target.parse({ self: {} });
    if (result2.success) {
      result2.value.prop;
    }
    const a: A = { self: { self: { self: { self: {} } } } };

    expect(A.shape.self.memberTypes[0]).toEqual(A);

    type ExpectedAShape = { self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('feed() allows coercions', () => {
    const AnotherDateLike = t.unknown.to(t.date); //, x => coerceToDate(x as any));
    const DateLike = t.coerce(t.date, coerceToDate);

    // const DateLike = t.date.from(t.union(t.number, t.string, t.date), coerceToDate);
    // const DateLike2 = t.date.from(DateLike);

    const result = DateLike.parse(1232131);

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(new Date(1232131));
    }
  });

  it('where() works with recursive types', () => {
    class ADef {
      prop = t.string;
      self? = t
        .obj(ADef)
        .where(x => x.prop !== '')
        .opt();
    }

    const A = t.obj(ADef, 'A');
    type A = t.Infer<typeof A>;

    expect(A.shape.self.memberTypes[0]?.name).toEqual('A');

    type ExpectedAShape = { prop: string; self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });
});
