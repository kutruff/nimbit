/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { expectType, expectTypesSupportAssignment, type TypeEqual } from './test/utilities';

describe('Unions of types', () => {
  describe('union()', () => {
    it('combines simple primitives', () => {
      const Target = t.union(t.string, t.boolean);
      type Target = t.Infer<typeof Target>;

      type ExpectedDefinitionType = t.UnionType<[typeof t.string, typeof t.boolean], string | boolean>;
      expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

      expect(Target.kind).toEqual('union');
      expect(Target.members.length).toEqual(2);
      expect(Target.members).toContainEqual(t.string);
      expect(Target.members).toContainEqual(t.boolean);
    });

    describe('union of unions', () => {
      it('combines peer unions', () => {
        const peer0 = t.union(t.string, t.number);
        const peer1 = t.union(t.boolean, t.bigint);
        const Target = t.union(peer0, peer1);
        type Target = t.Infer<typeof Target>;

        type ExpectedDefinitionType = t.UnionType<[typeof peer0, typeof peer1], string | number | boolean | bigint>;
        expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

        expect(Target.kind).toEqual('union');

        expect(Target.members.length).toEqual(2);
        expect(Target.members).toContainEqual(t.union(t.string, t.number));
        expect(Target.members).toContainEqual(t.union(t.boolean, t.bigint));
      });

      describe('nested unions', () => {
        it('combines depth 1 unions', () => {
          const subUnion = t.union(t.boolean, t.bigint);
          const Target = t.union(t.string, subUnion);
          type Target = t.Infer<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<[typeof t.string, typeof subUnion], string | boolean | bigint>;

          expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

          expect(Target.kind).toEqual('union');
          expect(Target.members.length).toEqual(2);
          expect(Target.members).toContainEqual(t.string);
          expect(Target.members).toContainEqual(t.union(t.boolean, t.bigint));
        });

        it('combines depth 3 unions', () => {
          const union0 = t.union(t.number, t.bigint);
          const union1 = t.union(t.boolean, union0);
          const Target = t.union(t.string, union1);
          type Target = t.Infer<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            [typeof t.string, typeof union1],
            string | number | boolean | bigint
          >;
          expectType<TypeEqual<ExpectedDefinitionType, typeof Target>>(true);

          expect(Target.kind).toEqual('union');
          expect(Target.members.length).toEqual(2);
          expect(Target.members).toContainEqual(t.string);
          expect(Target.members).toContainEqual(t.union(t.boolean, t.union(t.number, t.bigint)));
        });
      });
    });
  });

  describe('flatten', () => {
    it('works', () => {
      const Target = t.union(t.union(t.union(t.number, t.bigint)), t.number, t.union(t.number, t.bigint));
      // type Unpacked1 = t.UnpackUnion<typeof Union1>;
      type Flattened = t.FlattenUnionMembers<typeof Target>;
      const Result = t.flattenUnion(Target);
      type Result = t.Infer<typeof Result>;

      type ExpectedDefinitionType = t.UnionType<
        [typeof t.number, typeof t.bigint, typeof t.number, typeof t.number, typeof t.bigint],
        number | bigint
      >;

      expectType<TypeEqual<ExpectedDefinitionType, typeof Result>>(true);
      expectType<TypeEqual<Result, number | bigint>>(true);

      const expected = t.union(t.number, t.bigint, t.number, t.number, t.bigint);
      expect(Result.members.map(t => t.kind)).toEqual(expected.members.map(t => t.kind));
    });
  });

  describe('unwrap', () => {
    it('returns single when only undef and that value', () => {
      const Target = t.union(t.string, t.undef);
      const Result = Target.unwrap();
      type Result = t.Infer<typeof Result>;

      expect(Result).toEqual(t.string);

      expectType<TypeEqual<typeof Result, typeof t.string>>(true);
      expectType<TypeEqual<Result, string>>(true);
    });

    it('is shallow ', () => {
      const Target = t.union(t.union(t.string), t.undef);
      const Result = Target.unwrap();
      type Result = t.Infer<typeof Result>;

      const expected = t.union(t.string);
      expect(Result).toEqual(expected);

      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expectType<TypeEqual<Result, string>>(true);
    });

    it('returns single when undef and null others', () => {
      const Target = t.union(t.string, t.nul, t.undef);
      const Result = Target.unwrap();
      type Result = t.Infer<typeof Result>;

      const expected = t.string;
      expect(Result).toEqual(expected);

      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expectType<TypeEqual<Result, string>>(true);
    });

    it('returns union when undef and others', () => {
      const Target = t.union(t.string, t.nul, t.undef, t.bigint);
      const Result = Target.unwrap();
      type Result = t.Infer<typeof Result>;

      const expected = t.union(t.string, t.bigint);
      expect(Result).toEqual(expected);

      expectType<TypeEqual<typeof Result, typeof expected>>(true);
      expectType<TypeEqual<Result, string | bigint>>(true);
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
