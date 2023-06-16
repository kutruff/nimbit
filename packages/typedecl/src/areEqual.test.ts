import * as t from './index';

describe('Type equality', () => {
  describe('areEqual()', () => {
    it.each([
      [t.string, t.string, true],
      [t.string, t.boolean, false],
      [t.string, { kind: 'string' } as t.Type<'string'>, true],
      [t.string, { kind: 'boolean' } as t.Type<'boolean'>, false],
      [t.array(t.bigint), { kind: 'array', elementType: { kind: 'bigint' } } as t.ArrayType<typeof t.bigint>, true],
      [
        t.array(t.literal('fooLiteral')),
        { kind: 'array', elementType: { kind: 'literal', literal: 'fooLiteral' } } as t.ArrayType<
          t.LiteralType<'fooLiteral'>
        >,
        true
      ],
      [t.union(t.string, t.boolean), t.union(t.boolean, t.string), true],
      [
        t.union(t.string, t.boolean),
        t.union({ kind: 'boolean' } as t.Type<'boolean'>, { kind: 'string' } as t.Type<'string'>),
        true
      ],
      [t.union(t.string, t.boolean, t.bigint), t.union(t.boolean, t.string), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.opt(t.string) }), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.string }), true],
      [t.obj({ p0: t.string }), t.obj({ p1: t.string }), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.boolean }), false],
      [t.obj({ p0: t.string }), t.obj({ p0: t.string, p1: t.undef }), false], // Interesting case.  An object with an undefined property is wider than the other type
      [t.obj({ p0: t.string, p1: t.obj({ n: t.number }) }), t.obj({ p0: t.string, p1: t.obj({ n: t.number }) }), true]
    ])('areEqual(%s, %s)', (a: t.Type, b: t.Type, expected: boolean) => {
      expect(t.areEqual(a, b)).toEqual(expected);
    });

    describe('recursive types', () => {
      it('self recursive are equal', () => {
        class ADef {
          child = ADef;
        }

        class BDef {
          child = BDef;
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
          child = ADef;
          prop = t.bigint;
        }

        class BDef {
          child = BDef;
          prop = t.bigint;
        }

        const A = t.obj(ADef);
        const B = t.obj(BDef);

        expect(t.areEqual(A, A)).toEqual(true);
        expect(t.areEqual(A, B)).toEqual(true);
      });

      it('diverging self recursive are not equal', () => {
        class ADef {
          b = BDef;
          prop = t.string;
        }

        class BDef {
          a = ADef;
        }

        const A = t.obj(ADef);
        type A = t.Infer<typeof A>;

        const B = t.obj(BDef);
        type B = t.Infer<typeof B>;

        expect(t.areEqual(A, A)).toEqual(true);
        expect(t.areEqual(A, B)).toEqual(false);
      });

      it('mutally recursive are not equal', () => {
        class ADef {
          b = BDef;
        }

        class BDef {
          a = ADef;
        }

        const A = t.obj(ADef);
        const B = t.obj(BDef);

        expect(t.areEqual(A, B)).toEqual(false);
      });
    });
  });
});
