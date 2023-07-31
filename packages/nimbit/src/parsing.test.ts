/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  any,
  bigint,
  boolean,
  date,
  invalidTypeError,
  never,
  nul,
  number,
  pass,
  string,
  symbol,
  undef,
  unknown
} from '.';
import * as t from '.';
import { expectTypesSupportAssignment } from './test/utilities';

//TODO: refactor parsing tests and account for error conditions.

describe('Typ parsing', () => {
  describe('catch()', () => {
    it('returns value on failure', () => {
      const result = string.catch('hello').safeParse(123);

      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual('hello');
      }
    });

    it('not used on success', () => {
      const result = string.catch('hello').safeParse('world');

      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual('world');
      }
    });
  });
});

describe('Object parsing', () => {
  it('parses', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    type Person = t.Infer<typeof Person>;
    const result = Person.safeParse({ name: 'John', age: 10, isActive: true });

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true });
    }
  });

  it('fails when a property fails', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number
    });

    const result = Person.safeParse({ name: 'John', age: '10' } as any);

    expect(result.success).toEqual(false);
  });

  it('fails when properties are missing', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    const result = Person.safeParse({ name: 'John', age: 10 } as any);

    expect(result.success).toEqual(false);
  });

  it('strips objects when policy is strip', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.strip
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true });
      expect((result.data as any).extraProperty).toEqual(undefined);
    }
  });

  it('strict parsing fails with extra property', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.strict
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(false);
  });

  it('strict parsing succeeds when just the right number of props', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.strict
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true });
      expect((result.data as any).extraProperty).toEqual(undefined);
    }
  });

  it('passthrough parsing leaves properties not on the shape', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.passthrough
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' });
    }
  });

  it('catchall handles all unknown properties and ignores whatever policy is set', () => {
    const Person = t
      .obj(
        {
          name: t.string,
          age: t.number,
          isActive: t.boolean
        },
        'Person',
        t.PropertyPolicy.strict
      )
      .catchall(string);

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' });
    }
  });

  it('catchall failures cause all parsing to fail', () => {
    const Person = t
      .obj(
        {
          name: t.string,
          age: t.number,
          isActive: t.boolean
        },
        'Person',
        t.PropertyPolicy.strip
      )
      .catchall(string.where(x => x === 'hello'));

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(false);
  });
});

describe('TypeConverter', () => {
  it('supports where', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number.where(x => x > 21),
      isActive: t.boolean
    });

    type Person = t.Infer<typeof Person>;
    const result = Person.safeParse({ name: 'John', age: 10, isActive: true });

    expect(result.success).toEqual(false);

    const PersonOver = t.obj({
      name: t.string,
      age: t.number.where(x => x >= 21),
      isActive: t.boolean
    });

    type PersonOver = t.Infer<typeof PersonOver>;
    const resultOver = PersonOver.safeParse({ name: 'Bob', age: 21, isActive: true });

    expect(resultOver.success).toEqual(true);
    if (resultOver.success) {
      expect(resultOver.data).toEqual({ name: 'Bob', age: 21, isActive: true });
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

    const result = target.safeParse('24');

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.data).toEqual(24);
    }
  });

  // it('supports to as method', () => {
  //   const target = t.string.to2(x => ({ success: true, value: x + 'hello' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24hello');
  //   }
  // });

  // it('to() chains left to right', () => {
  //   const target = t.string
  //     .to2(x => ({ success: true, value: x + 'hello' }))
  //     .to2(x => ({ success: true, value: x + 'there' }));

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
  //   //       .to2(x => ({ success: true, value: x + 'to1 ' })),
  //   //     t.string,
  //   //     x => ({ success: true, value: x + 'from2' })
  //   //   )
  //   //   .to2(x => ({ success: true, value: x + 'to2 ' }));

  //   const target = t
  //     .feed(x => ({ success: true, value: x + 'from2' }), t.string)

  //     .to2(x => ({ success: true, value: x + 'to2 ' }));

  //   // .to2(x => ({ success: true, value: x + 'to2 ' }))
  //   // .from(x => ({ success: true, value: x + 'from1 ' }))
  //   // .to2(x => ({ success: true, value: x + 'to3 ' }))
  //   // .from(x => ({ success: true, value: x + 'from2 ' }))
  //   // .to2(x => ({ success: true, value: x + 'to4 ' }))
  //   // .from(x => ({ success: true, value: x + 'from3 ' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24from3 from2 from1 to1 to2 to3 to4 ');
  //   }
  // });

  // it('from() first then to() chains', () => {
  //   const target = t.string
  //     .to2(x => ({ success: true, value: x + 'to1 ' }))
  //     .to2(x => ({ success: true, value: x + 'to2 ' }))
  //     .from(x => ({ success: true, value: x + 'from1 ' }))
  //     .to2(x => ({ success: true, value: x + 'to3 ' }))
  //     .from(x => ({ success: true, value: x + 'from2 ' }))
  //     .to2(x => ({ success: true, value: x + 'to4 ' }))
  //     .from(x => ({ success: true, value: x + 'from3 ' }));

  //   const result = target.parse('24');

  //   expect(result.success).toEqual(true);
  //   if (result.success) {
  //     expect(result.value).toEqual('24from3 from2 from1 to1 to2 to3 to4 ');
  //   }
  // });

  // it('complex chain', () => {
  //   const target = t.string
  //     // .to2(x => ({ success: true, value: x + 'to1 ' }))
  //     // .to2(x => ({ success: true, value: x + 'to2 ' }))
  //     // .from(x => ({ success: true, value: x + 'from1 ' }))
  //     // .to2(x => ({ success: true, value: x + 'to3 ' }))
  //     // .from(x => ({ success: true, value: x + 'from2 ' }))
  //     .to2(t.number, parseNumber)
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

    type DateLikeType = t.Resolve<typeof DateLike>;

    type DateLike = t.Infer<typeof DateLike>;

    const asD = t.string.to(DateLike);

    const unsadf = asD.safeParse('hello');

    asD.safeParse('hello');
    const asIsoString = DateLike.to(t.string, x => t.pass(x.toISOString()));
    asIsoString.safeParse(new Date());
    const assigned: DateLike = new Date();
    const result = DateLike.safeParse(1232131);

    if (result.success) {
      expect(result.data).toEqual(new Date(1232131));
    }

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.data).toEqual(new Date(1232131));
    }
  });

  it('to() basic coercion condition failure', () => {
    const target = unknown.to(number, x => Number(x)).where(x => !isNaN(x));

    const result = target.safeParse('hello');
    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error).toEqual({ kind: 'condition', actual: 'hello' });
    }
  });

  it('to() basic coercion custom error', () => {
    const target = unknown
      .to(number, x => Number(x))
      .where(
        x => !isNaN(x),
        x => invalidTypeError('asNumber', x)
      );
    const result = target.safeParse('hello');

    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error).toEqual({ kind: 'invalid_type', expected: 'asNumber', actual: 'hello' });
    }
  });

  it('to() coercion with thrown error', () => {
    const target = unknown.to(number, x => {
      throw Error('bad value');
    });

    const result = target.safeParse('hello');

    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error).toEqual({ kind: 'thrown', error: Error('bad value') });
    }
  });

  it('to() basic objects', () => {
    const Source = t.obj({ prop: t.string });
    const target = Source.to(t.obj({ prop: t.number }), x => pass({ prop: Number(x.prop) }));
    const result = target.safeParse({ prop: '1243' });

    const EnumTest = t.enumm('EnumTest', ['a', 'b', 'c']);
    const enumResult = EnumTest.safeParse('a');
    const enumToString = EnumTest.to(t.string, x => t.pass(x));
    type enumToString = t.Infer<typeof enumToString>;

    const stringResult = t.string.safeParse('hello');

    const ArrayTest = t.array(t.number);
    type ArrayTest = t.Infer<typeof ArrayTest>;
    const arrayResult = ArrayTest.safeParse([1, 2, 3]);

    const arrayToString = ArrayTest.to(t.string, x => t.pass(x.join(',')));
    type arrayToString = t.Infer<typeof arrayToString>;
    const arrayToStringResult = arrayToString.safeParse([1, 2, 3]);

    const stringToArray = t.string.to(ArrayTest, x => t.pass([Number(x)]));
    type stringToArray = t.Infer<typeof stringToArray>;
    const stringToArrayResult = stringToArray.safeParse('1,2,3');

    const stringToNumber = t.string.to(t.number, x => t.pass(Number(x)));
    stringToNumber.safeParse('123');
    // type ArrayTestWithInput = ReturnType<typeof ArrayTest._withInput<string>>;
    // type ArrayTestParseType = ArrayTestWithInput['parse'];

    const unionTest = t.union(t.string, t.number);
    type unionTest = t.Infer<typeof unionTest>;
    const unionTestResult = unionTest.safeParse('123');

    const unionToString = unionTest.to(t.string, x => t.pass(x as string));
    type unionToString = t.Infer<typeof unionToString>;
    const unionToStringResult = unionToString.safeParse('123');

    const singleStringUnion = t.union(t.string, t.number);

    const opted = singleStringUnion.opt();

    const stringToUnion = t.string.to(singleStringUnion);
    type stringToUnion = t.Infer<typeof stringToUnion>;
    const stringToUnionResult = stringToUnion.safeParse('123');

    const unionedAgain = t.union(stringToUnion, t.number);

    type isUnion = (typeof unionedAgain)['members'];

    const tupleTest = t
      .tuple([t.string, t.string])
      .to(t.tuple([t.string, t.number]), x => pass(t.asTuple(x[0], Number(x[1]))));
    const resultTuple = tupleTest.safeParse(['hello', '123']);
    if (resultTuple.success) {
      expect(resultTuple.data).toEqual(['hello', 123]);
    }

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.data.prop).toEqual(1243);
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
    const result = literalTest.safeParse('hello');
    if (result.success) {
      result.data;
    }
    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;
    const target = A.to(t.obj({ prop: A }), x => pass({ prop: x }));

    const thing = t.string.to(
      t.number,
      x => x.length,
      val => ({ kind: 'general', message: val.toString() })
    );

    type adfadgagdag = t.Infer<typeof target>;
    const result2 = target.safeParse({
      literalProp: 'world',
      tupleProp: ['myString', 123],
      self: { literalProp: 'world', tupleProp: ['someString', 2354] }
    });

    if (result2.success) {
      result2.data.prop;
      expect(result2.data.prop.self?.tupleProp[1]).toEqual(2354);
    }
    // const a: A = { self: {literalProp: 'world', } } } };

    expect(A.shape.self?.members[0]).toEqual(A);
  });

  it('to() allows self recursion', () => {
    class ADef {
      self? = t.obj(ADef).opt();
    }

    expect(
      t.string
        .to(
          t.number,
          x => {
            throw new Error();
          },
          "it didn't work"
        )
        .safeParse('hello')
    ).toMatchObject({ success: false, error: { kind: 'thrown', message: "it didn't work" } });

    expect(
      t.string
        .tweak(x => {
          throw new Error();
        }, "it didn't work")
        .safeParse('hello')
    ).toMatchObject({ success: false, error: { kind: 'thrown', message: "it didn't work" } });

    expect(t.string.tweak(x => x + '_', "it didn't work").safeParse('hello')).toMatchObject({
      success: true,
      data: 'hello_'
    });

    const A = t.obj(ADef);
    type A = t.Infer<typeof A>;
    const target = A.to(t.obj({ prop: A }), x => pass({ prop: x }));

    type adfadgagdag = t.Infer<typeof target>;
    const result2 = target.safeParse({ self: {} });
    if (result2.success) {
      result2.data.prop;
    }
    const a: A = { self: { self: { self: { self: {} } } } };

    expect(A.shape.self.members[0]).toEqual(A);

    // t.string.where(t.length(1, 2));
    // t.number.where(t.min(1));
    // t.number.where(x => x > 1);
    type ExpectedAShape = { self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('feed() allows coercions', () => {
    const AnotherDateLike = t.unknown.to(t.date); //, x => coerceToDate(x as any));
    const DateLike = t.to(t.date, coerceToDate);

    t.string.to(
      t.number,
      x => 100,
      v => t.invalidTypeError(v, 'number')
    );
    // const DateLike = t.date.from(t.union(t.number, t.string, t.date), coerceToDate);
    // const DateLike2 = t.date.from(DateLike);

    const result = DateLike.safeParse(1232131);

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.data).toEqual(new Date(1232131));
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

    expect(A.shape.self.members[0]?.name).toEqual('A');

    type ExpectedAShape = { prop: string; self?: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('where() works with recursive types', () => {
    const TestObj = t.obj({
      strProp: t.string,
      nested: t.obj({
        nestedA: t.number,
        nestedB: t.string
      })
    });

    const result = TestObj.safeParse({
      strProp: 1337,
      nested: {
        nestedA: 'wrong',
        nestedB: 7n
      }
    });
    

    expect(result.success).toEqual(false);
    if (!result.success) {
      console.log(t.formatError(result.error));
    }
  });
});
