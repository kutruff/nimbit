/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Unions of types', () => {
  describe('union()', () => {
    it('combines simple primitives', () => {
      const Target = t.union(t.string, t.boolean);
      type Target = t.Infer<typeof Target>;

      type ExpectedDefinitionType = t.UnionType<typeof t.string | t.BooleanType, string | boolean>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target.kind).toEqual('union');
      expect(Target.memberTypes.length).toEqual(2);
      expect(Target.memberTypes).toContain(t.string);
      expect(Target.memberTypes).toContain(t.boolean);
    });

    describe('union of unions', () => {
      it('combines peer unions', () => {
        const Target = t.union(t.union(t.string, t.number), t.union(t.boolean, t.bigint));
        type Target = t.Infer<typeof Target>;

        type ExpectedDefinitionType = t.UnionType<
          typeof t.string | t.BooleanType | t.NumberType | t.BigIntType,
          string | number | boolean | bigint
        >;

        expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
        expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

        expect(Target.kind).toEqual('union');
        expect(Target.memberTypes.length).toEqual(4);
        expect(Target.memberTypes).toContain(t.string);
        expect(Target.memberTypes).toContain(t.number);
        expect(Target.memberTypes).toContain(t.boolean);
        expect(Target.memberTypes).toContain(t.bigint);
      });

      describe('nested unions', () => {
        it('combines depth 1 unions', () => {
          const Target = t.union(t.string, t.union(t.boolean, t.bigint));
          type Target = t.Infer<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            typeof t.string | t.BooleanType | t.BigIntType,
            string | boolean | bigint
          >;

          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target.kind).toEqual('union');
          expect(Target.memberTypes.length).toEqual(3);
          expect(Target.memberTypes).toContain(t.string);
          expect(Target.memberTypes).toContain(t.boolean);
          expect(Target.memberTypes).toContain(t.bigint);
        });

        it('combines depth 3 unions', () => {
          const Target = t.union(t.string, t.union(t.boolean, t.union(t.number, t.bigint)));
          type Target = t.Infer<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            typeof t.string | t.BooleanType | t.NumberType | t.BigIntType,
            string | boolean | number | bigint
          >;

          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target.kind).toEqual('union');
          expect(Target.memberTypes.length).toEqual(4);
          expect(Target.memberTypes).toContain(t.string);
          expect(Target.memberTypes).toContain(t.boolean);
          expect(Target.memberTypes).toContain(t.number);
          expect(Target.memberTypes).toContain(t.bigint);
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
