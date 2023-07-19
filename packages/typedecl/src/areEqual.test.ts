import * as t from './index';

describe('Type equality', () => {
  describe('areEqual()', () => {
    it.each([
      [t.string, t.string, true],
      [t.string, t.boolean, false],
      [t.union(t.string, t.boolean), t.union(t.boolean, t.string), true],
      [t.union(t.string, t.boolean, t.bigint), t.union(t.boolean, t.string), false],
      [t.union(t.string, t.boolean), t.union(t.union(t.boolean, t.string), t.union(t.boolean, t.string)), true],
      [
        t.union(t.literal('fooLiteral'), t.literal('barLiteral')),
        t.union(t.literal('barLiteral'), t.literal('fooLiteral')),
        true
      ],
      [t.array(t.bigint), t.array(t.bigint), true],
      [t.array(t.number), t.array(t.string), false],
      [t.array(t.literal('fooLiteral')), t.array(t.literal('fooLiteral')), true],
      [
        t.array(t.union(t.literal('fooLiteral'), t.literal('barLiteral'))),
        t.array(t.union(t.literal('barLiteral'), t.literal('fooLiteral'))),
        true
      ],
      [t.enumm('test', ['a', 'b', 'c']), t.enumm('test', ['a', 'b', 'c']), true],
      [t.enumm('test', ['b', 'a', 'c']), t.enumm('test', ['a', 'b', 'c']), true],
      [t.enumm('test', ['a', 'b', 'c']), t.enumm('differentName', ['a', 'b', 'c']), false],
      [t.enumm('test', ['a', 'b']), t.enumm('test', ['a', 'b', 'c']), false],
      [t.tuple([t.number, t.string]), t.tuple([t.number, t.string]), true],
      [t.tuple([t.string, t.number]), t.tuple([t.number, t.string]), false],
      [t.tuple([t.obj({ a: t.number }), t.number]), t.tuple([t.obj({ a: t.number }), t.number]), true],
      [t.map(t.number, t.string), t.map(t.number, t.string), true],
      [t.map(t.string, t.bigint), t.map(t.number, t.bigint), false],
      [t.map(t.string, t.bigint), t.map(t.string, t.number), false],
      [t.set(t.string), t.set(t.string), true],
      [t.set(t.string), t.set(t.number), false],
      [t.set(t.array(t.string)), t.set(t.array(t.string)), true],
      [t.set(t.array(t.string)), t.set(t.array(t.number)), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.string.opt() }), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.string }), true],
      [t.obj({ p0: t.string }), t.obj({ p1: t.string }), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.boolean }), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.string, p1: t.undef }), false], // Interesting case.  An object with an undefined property is wider than the other type
      [t.obj({ p0: t.string, p1: t.obj({ n: t.number }) }), t.obj({ p0: t.string, p1: t.obj({ n: t.number }) }), true]
    ])('areEqual(%s, %s)', (a: t.Typ, b: t.Typ, expected: boolean) => {
      expect(t.areEqual(a, b)).toEqual(expected);
    });

    describe('recursive types', () => {
      it('self recursive are equal', () => {
        class ADef {
          child = t.obj(ADef);
        }

        class BDef {
          child = t.obj(BDef);
        }

        const A = t.obj(ADef);
        type A = t.Infer<typeof A>;

        const B = t.obj(BDef);
        type B = t.Infer<typeof B>;

        expect(t.areEqual(A, A)).toEqual(true);
        expect(t.areEqual(A, B)).toEqual(true);
      });

      it('self recursive with matching shape are equal', () => {
        class ADef {
          child = t.obj(ADef);
          prop = t.bigint;
        }

        class BDef {
          child = t.obj(BDef);
          prop = t.bigint;
        }

        const A = t.obj(ADef);
        const B = t.obj(BDef);

        expect(t.areEqual(A, A)).toEqual(true);
        expect(t.areEqual(A, B)).toEqual(true);

        const a = new ADef();
        const b = new BDef();

        type AExtendsB = typeof a extends typeof b ? true : false;
        const aExtendsB: AExtendsB = true;
        expect(aExtendsB).toEqual(true);

        type BExtendsA = typeof a extends typeof b ? true : false;
        const bExtendsA: BExtendsA = true;
        expect(bExtendsA).toEqual(true);
      });

      it('diverging self recursive are not equal', () => {
        class ADef {
          b = t.obj(BDef);
          prop = t.string;
        }

        class BDef {
          a = t.obj(ADef);
        }

        const A = t.obj(ADef);
        type A = t.Infer<typeof A>;

        const B = t.obj(BDef);
        type B = t.Infer<typeof B>;

        expect(t.areEqual(A, A)).toEqual(true);
        expect(t.areEqual(A, B)).toEqual(false);

        const a = new ADef();
        const b = new BDef();

        type AExtendsB = typeof a extends typeof b ? true : false;
        const aExtendsB: AExtendsB = false;
        expect(aExtendsB).toEqual(false);

        type BExtendsA = typeof a extends typeof b ? true : false;
        const bExtendsA: BExtendsA = false;
        expect(bExtendsA).toEqual(false);
      });

      it('mutally recursive are not equal', () => {
        class ADef {
          b = t.obj(BDef);
        }

        class BDef {
          a = t.obj(ADef);
        }

        const A = t.obj(ADef);
        const B = t.obj(BDef);

        expect(t.areEqual(A, B)).toEqual(false);

        const a = new ADef();
        const b = new BDef();

        type AExtendsB = typeof a extends typeof b ? true : false;
        const aExtendsB: AExtendsB = false;
        expect(aExtendsB).toEqual(false);

        type BExtendsA = typeof a extends typeof b ? true : false;
        const bExtendsA: BExtendsA = false;
        expect(bExtendsA).toEqual(false);
      });
    });
  });
});
