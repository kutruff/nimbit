import * as t from '.';
import { toParseResult } from '.';
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
    return toParseResult<number>(result, !isNaN(result));
  }

  it('parsedFrom() works', () => {
    const target = t.number.from(parseNumber);

    const result = target.parse('2123');
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(2123);
    }
  });

  it('parsedFrom() is a chain of from in right to left', () => {
    const target = t.number
      .from(x => {
        const result = 2 * Number(x);
        return toParseResult(result, !isNaN(result));
      })
      .from(x => {
        const result = Number(x) + 1;
        return toParseResult(result, !isNaN(result));
      });

    const result = target.parse('24');

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(50);
    }
  });

  it('supports to', () => {
    const target = t.string.to(t.number, parseNumber);

    const result = target.parse('24');

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(24);
    }
  });

  it('supports to as method', () => {
    const target = t.string.to(x => ({ success: true, value: x + 'hello' }));

    const result = target.parse('24');

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual('24hello');
    }
  });

  const coerceToDate = (x: string | number | Date) => {
    const result = new Date(x);
    return toParseResult<Date>(result, !isNaN(result.getTime()));
  };

  it('to() makes datelike easy', () => {
    const DateLike = t.union(t.number, t.string, t.date).to(t.date, coerceToDate);

    const result = DateLike.parse(1232131);

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(new Date(1232131));
    }
  });

  it('from() makes datelike easy', () => {
    const DateLike = t.date.from(t.union(t.number, t.string, t.date), coerceToDate);

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
