/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { expectType, expectTypesSupportAssignment, type TypeEqual } from './test/utilities';

describe('Unions of types', () => {
  describe('union()', () => {
    it('combines simple primitives', () => {
      const Target = t.union(t.string, t.boolean);
      type Target = t.Infer<typeof Target>;

      type ExpectedDefinitionType = t.UnionType<'string' | 'boolean', string | boolean, string | boolean>;
      expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

      expect(Target.kind).toEqual(['string', 'boolean']);
      expect(Target.unionTypes.length).toEqual(2);
      expect(Target.unionTypes).toContainEqual(t.string);
      expect(Target.unionTypes).toContainEqual(t.boolean);
    });

    describe('union of unions', () => {
      it('combines peer unions', () => {
        const Target = t.union(t.union(t.string, t.number), t.union(t.boolean, t.bigint));
        type Target = t.Infer<typeof Target>;

        type ExpectedDefinitionType = t.UnionType<
          'string' | 'boolean' | 'number' | 'bigint',
          string | number | boolean | bigint,
          string | number | boolean | bigint
        >;
        expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

        expect(Target.kind).toEqual([
          ['string', 'number'],
          ['boolean', 'bigint']
        ]);

        expect(Target.unionTypes.length).toEqual(2);
        expect(Target.unionTypes).toContainEqual(t.union(t.string, t.number));
        expect(Target.unionTypes).toContainEqual(t.union(t.boolean, t.bigint));
      });

      describe('nested unions', () => {
        it('combines depth 1 unions', () => {
          const Target = t.union(t.string, t.union(t.boolean, t.bigint));
          type Target = t.Infer<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            'string' | 'boolean' | 'bigint',
            string | boolean | bigint,
            string | boolean | bigint
          >;
          expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

          expect(Target.kind).toEqual(['string', ['boolean', 'bigint']]);
          expect(Target.unionTypes.length).toEqual(2);
          expect(Target.unionTypes).toContainEqual(t.string);
          expect(Target.unionTypes).toContainEqual(t.union(t.boolean, t.bigint));
        });

        it('combines depth 3 unions', () => {
          const Target = t.union(t.string, t.union(t.boolean, t.union(t.number, t.bigint)));
          type Target = t.Infer<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            'string' | 'boolean' | 'number' | 'bigint',
            string | number | boolean | bigint,
            string | number | boolean | bigint
          >;
          expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

          expect(Target.kind).toEqual(['string', ['boolean', ['number', 'bigint']]]);
          expect(Target.unionTypes.length).toEqual(2);
          expect(Target.unionTypes).toContainEqual(t.string);
          expect(Target.unionTypes).toContainEqual(t.union(t.boolean, t.union(t.number, t.bigint)));
        });
      });
    });
  });

  describe('type inference', () => {
    it('infers well with object hierarchies of unions', () => {
      const Target = t.obj({
        prop: t.string,
        subUnion0: t.union(
          t.obj({
            prop: t.string,
            subUnion00: t.union(t.boolean, t.union(t.number, t.bigint))
          }),
          t.obj({
            prop: t.string,
            subUnion01: t.union(t.string, t.union(t.number, t.bigint))
          })
        )
      });

      type Target = t.Infer<typeof Target>;
      const targets: Array<Target> = [
        {
          prop: 'strValue',
          subUnion0: { prop: 'subValue', subUnion00: true }
        },
        {
          prop: 'strValue',
          subUnion0: { prop: 'subValue', subUnion00: 1 }
        },
        {
          prop: 'strValue',
          subUnion0: { prop: 'subValue', subUnion00: BigInt(1) }
        },
        {
          prop: 'strValue',
          subUnion0: { prop: 'subValue', subUnion01: 'str' }
        },
        {
          prop: 'strValue',
          subUnion0: { prop: 'subValue', subUnion01: 2 }
        },
        {
          prop: 'strValue',
          subUnion0: { prop: 'subValue', subUnion01: BigInt(1) }
        }
      ];
    });
  });
});
