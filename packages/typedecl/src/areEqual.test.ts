import * as t from './index';

describe('Type equality', () => {
  describe('areEqual()', () => {
    it.each([
      [t.str, t.str, true],
      [t.str, t.bool, false],
      [t.str, { kind: 'string' } as t.Type<'string'>, true],
      [t.str, { kind: 'boolean' } as t.Type<'boolean'>, false],
      [t.array(t.bgint), { kind: 'array', elementType: { kind: 'bigint' } } as t.ArrayType<typeof t.bgint>, true],
      [
        t.array(t.literal('fooLiteral')),
        { kind: 'array', elementType: { kind: 'literal', literal: 'fooLiteral' } } as t.ArrayType<
          t.LiteralType<'fooLiteral'>
        >,
        true
      ],
      [t.union(t.str, t.bool), t.union(t.bool, t.str), true],
      [
        t.union(t.str, t.bool),
        t.union({ kind: 'boolean' } as t.Type<'boolean'>, { kind: 'string' } as t.Type<'string'>),
        true
      ],
      [t.union(t.str, t.bool, t.bgint), t.union(t.bool, t.str), false],
      [t.obj({ p0: t.str }), t.obj({ p0: t.optProp(t.str) }), false],
      [t.obj({ p0: t.str }), t.obj({ p0: t.str }), true],
      [t.obj({ p0: t.str }), t.obj({ p1: t.str }), false],
      [t.obj({ p0: t.str }), t.obj({ p0: t.bool }), false],
      [t.obj({ p0: t.str }), t.obj({ p0: t.str, p1: t.undef }), false], // Interesting case.  An object with an undefined property is wider than the other type
      [t.obj({ p0: t.str, p1: t.obj({ n: t.num }) }), t.obj({ p0: t.str, p1: t.obj({ n: t.num }) }), true]
    ])('areEqual(%s, %s)', (a: t.Type, b: t.Type, expected: boolean) => {
      expect(t.areEqual(a, b)).toEqual(expected);
    });

    describe('recursive types', () => {
      it('self recursive are equal', () => {
        interface SelfReferencingA {
          child: SelfReferencingA;
        }

        const SelfReferencingA = t.declareObj<SelfReferencingA>();
        t.defineDeclaration(SelfReferencingA, {
          child: SelfReferencingA
        });

        interface SelfReferencingB {
          child: SelfReferencingB;
        }

        const SelfReferencingB = t.declareObj<SelfReferencingB>();
        t.defineDeclaration(SelfReferencingB, {
          child: SelfReferencingB
        });

        expect(t.areEqual(SelfReferencingA, SelfReferencingA)).toEqual(true);
        expect(t.areEqual(SelfReferencingA, SelfReferencingB)).toEqual(true);
      });

      it('self recursive with matching shape are equal', () => {
        interface SelfReferencingA {
          child: SelfReferencingA;
          prop: bigint;
        }

        const SelfReferencingA = t.declareObj<SelfReferencingA>();
        t.defineDeclaration(SelfReferencingA, {
          child: SelfReferencingA,
          prop: t.bgint
        });

        interface SelfReferencingB {
          child: SelfReferencingB;
          prop: bigint;
        }

        const SelfReferencingB = t.declareObj<SelfReferencingB>();
        t.defineDeclaration(SelfReferencingB, {
          child: SelfReferencingB,
          prop: t.bgint
        });

        expect(t.areEqual(SelfReferencingA, SelfReferencingA)).toEqual(true);
        expect(t.areEqual(SelfReferencingA, SelfReferencingB)).toEqual(true);
      });

      it('diverging self recursive are not equal', () => {
        interface SelfReferencingA {
          child: SelfReferencingA;
          prop: string;
        }

        const SelfReferencingA = t.declareObj<SelfReferencingA>();
        t.defineDeclaration(SelfReferencingA, {
          child: SelfReferencingA,
          prop: t.str
        });

        interface SelfReferencingB {
          child: SelfReferencingB;
        }

        const SelfReferencingB = t.declareObj<SelfReferencingB>();
        t.defineDeclaration(SelfReferencingB, {
          child: SelfReferencingB
        });

        expect(t.areEqual(SelfReferencingA, SelfReferencingA)).toEqual(true);
        expect(t.areEqual(SelfReferencingA, SelfReferencingB)).toEqual(false);
      });

      it('mutally recursive are not equal', () => {
        interface Bar {
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
          foo: Foo
        });

        expect(t.areEqual(Foo, Bar)).toEqual(false);
      });
    });
  });
});
