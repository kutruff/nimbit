/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { number, obj, string } from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Typ', () => {
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

  describe('where()', () => {
    it('is successful when condition true', () => {
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

    it('fails when condtion false', () => {
      const target = t.number.where(x => x > 21);
      const result = target.safeParse(10);

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'condition', actual: 10 });
      }
    });

    it('failure with returning string', () => {
      const target = t.unknown.to(t.number, x => Number(x)).where(x => !isNaN(x), 'this failed');

      const result = target.safeParse('hello');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'condition', actual: 'hello', message: 'this failed' });
      }
    });

    it('failure with returning string through function', () => {
      const target = t.unknown
        .to(t.number, x => Number(x))
        .where(
          x => !isNaN(x),
          x => `this failed ${x}`
        );

      const result = target.safeParse('hello');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'general', actual: 'hello', message: 'this failed hello' });
      }
    });

    it('failure with returning ParseError', () => {
      const target = t.unknown
        .to(t.number, x => Number(x))
        .where(
          x => !isNaN(x),
          x => t.invalidTypeError('asNumber', x)
        );

      const result = target.safeParse('hello');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'invalid_type', expected: 'asNumber', actual: 'hello' });
      }
    });

    it('works with recursive types', () => {
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

    it('works with recursive types', () => {
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

    it.skip('allows reuse like documentation', () => {
      const nonEmpty = (x: string) => x !== '' && string != null;
      const min = (min: number) => (x: number) => x >= min;
      const range = (min: number, max: number) => (x: number) => x >= min && x <= max;
      const matches = (regex: RegExp) => (x: string) => regex.test(x);
      const email = string.where(matches(/^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i));

      email.parse('one@two.com');
      const formData = obj({
        name: string.where(nonEmpty),
        age: number.where(min(0)),
        quantity: number.where(range(1, 100)),
        mainEmail: email
      });

      formData.parse({
        name: '',
        age: -1,
        quantity: 0,
        mainEmail: 'bob@fcom'
      });
    });
  });

  describe('to()', () => {
    function parseNumber(x: unknown) {
      const result = Number(x);
      return !isNaN(result) ? t.pass(result) : t.fail();
    }

    it('works with ParseResult overload', () => {
      const target = t.string.to(t.number, parseNumber);

      const result = target.safeParse('24');

      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual(24);
      }
    });

    it('fails when the ParseResult overload fails', () => {
      const target = t.string.to(t.number, x => t.fail({ kind: 'general', actual: x, message: 'it failed, yo' }));

      const result = target.safeParse('24');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'general', actual: '24', message: 'it failed, yo' });
      }
    });

    it('works with the vanilla output type overload ', () => {
      const target = t.string.to(t.number, x => Number(x) + 1);

      const result = target.safeParse('15');

      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual(16);
      }
    });

    it('fails when the vanilla output type overload throws', () => {
      const target = t.string.to(t.number, () => {
        throw Error('error was thrown, yo');
      });

      const result = target.safeParse('24');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'thrown', error: Error('error was thrown, yo'), actual: '24' });
      }
    });

    it('fails when the vanilla output type overload throws with custom message', () => {
      const target = t.string.to(
        t.number,
        () => {
          throw Error('error was thrown, yo');
        },
        'custom message 123'
      );

      const result = target.safeParse('24');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({
          kind: 'thrown',
          error: Error('error was thrown, yo'),
          actual: '24',
          message: 'custom message 123'
        });
      }
    });

    it('fails when the vanilla output type overload throws with custom message from function', () => {
      const target = t.string.to(
        t.number,
        () => {
          throw Error('error was thrown, yo');
        },
        value => 'custom message ' + value
      );

      const result = target.safeParse('24');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({
          kind: 'general',
          actual: '24',
          message: 'custom message 24'
        });
      }
    });

    it('fails when the vanilla output type overload throws with custom ParseError', () => {
      const target = t.string.to(
        t.number,
        () => {
          throw Error('error was thrown, yo');
        },
        value => ({ kind: 'general', actual: value, message: 'custom message ' + value })
      );

      const result = target.safeParse('24');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({
          kind: 'general',
          actual: '24',
          message: 'custom message 24'
        });
      }
    });

    const coerceToDate = (x: string | number | Date) => {
      const result = new Date(x);
      return !isNaN(result.getTime()) ? t.pass(result) : t.fail();
    };

    it('to() makes datelike easy', () => {
      const DateLike = t.union(t.number, t.string, t.date).to(t.date, coerceToDate);
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

    it('to() coercion with thrown error', () => {
      const target = t.unknown.to(t.number, x => {
        throw Error('bad value');
      });

      const result = target.safeParse('hello');

      expect(result.success).toEqual(false);
      if (!result.success) {
        expect(result.error).toEqual({ kind: 'thrown', error: Error('bad value'), actual: 'hello' });
      }
    });

    function expectParseToPass<TExpected>(
      type: t.Typ<unknown, unknown, TExpected>,
      value: unknown,
      expected: TExpected
    ) {
      const result = type.safeParse(value);
      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual(expected);
      }
    }

    it('supports all objects', () => {
      const Source = t.obj({ prop: t.string });
      const ObjTest = Source.to(t.obj({ anotherProp: t.number }), x => t.pass({ anotherProp: Number(x.prop) }));
      expectParseToPass(ObjTest, { prop: '19' }, { anotherProp: 19 });

      const EnumTest = t.enumm('EnumTest', ['a', 'b', 'c']);
      expectParseToPass(EnumTest, 'a', 'a');
      expectParseToPass(
        EnumTest.to(t.string, x => t.pass(x)),
        'b',
        'b'
      );

      expectParseToPass(t.string, 'a', 'a');
      expectParseToPass(
        t.string.to(t.number, x => t.pass(Number(x))),
        '234',
        234
      );

      expectParseToPass(t.literal('car'), 'car', 'car');
      expectParseToPass(
        t.literal(234).to(t.number, x => t.pass(x)),
        234,
        234
      );

      expectParseToPass(t.literal('car'), 'car', 'car');
      expectParseToPass(
        t.literal(234).to(t.literal(234), x => t.pass(x) satisfies t.ParseResult<234>),
        234,
        234
      );

      const ArrayTest = t.array(t.number);

      expectParseToPass(ArrayTest, [17, 2, 3], [17, 2, 3]);
      expectParseToPass(
        ArrayTest.to(t.number, x => t.pass(x.reduce((acc, x) => acc + x, 0))),
        [17, 2, 3],
        22
      );

      expectParseToPass(
        t.string.to(ArrayTest, x => t.pass([Number(x) + 1])),
        '17',
        [18]
      );

      const UnionTest = t.union(t.string, t.number).to(t.number, x => t.pass(Number(x) + 1));

      expectParseToPass(UnionTest, '17', 18);
      expectParseToPass(UnionTest, 17, 18);

      const TupleTest = t
        .tuple([t.string, t.string])
        .to(t.tuple([t.string, t.number]), x => t.pass(t.asTuple(x[0], Number(x[1]))));

      expectParseToPass(TupleTest, ['hello', '123'], ['hello', 123]);
    });

    it('stress test', () => {
      class ADef {
        self? = t.obj(ADef).opt();
        literalProp = t.literal('hello').to(t.literal('world'), x => t.pass('world' as const));
        tupleProp = t
          .tuple([t.string, t.string])
          .to(t.tuple([t.string, t.number]), x => t.pass(t.asTuple(x[0], Number(x[1]))));
      }

      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;
      const target = A.to(t.obj({ prop: A }), x => t.pass({ prop: x }));

      const result = target.safeParse({
        literalProp: 'world',
        tupleProp: ['myString', 123],
        self: { literalProp: 'world', tupleProp: ['someString', 2354] }
      });

      if (result.success) {
        result.data.prop;
        expect(result.data.prop.self?.tupleProp[1]).toEqual(2354);
      }
      // const a: A = { self: {literalProp: 'world', } } } };

      expect(A.shape.self?.members[0]).toEqual(A);
    });

    it('to() allows self recursion', () => {
      class ADef {
        self? = t.obj(ADef).opt();
      }

      const A = t.obj(ADef);
      type A = t.Infer<typeof A>;
      const target = A.to(t.obj({ prop: A }), x => t.pass({ prop: x }));

      const result2 = target.safeParse({ self: {} });
      if (result2.success) {
        result2.data.prop;
      }
      const a: A = { self: { self: { self: { self: {} } } } };

      expect(A.shape.self.members[0]).toEqual(A);

      type ExpectedAShape = { self?: A };
      expectTypesSupportAssignment<ExpectedAShape, A>();
      expectTypesSupportAssignment<A, ExpectedAShape>();
    });
  });
});
