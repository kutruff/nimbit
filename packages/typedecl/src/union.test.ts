/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Unions of types', () => {
  describe('union()', () => {
    it('combines simple primitives', () => {
      const Target = t.union(t.str, t.bool);
      type Target = t.ToTsType<typeof Target>;

      type ExpectedDefinitionType = t.UnionType<t.Type<'string'> | t.Type<'boolean'>>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target.kind).toEqual('union');
      expect(Target.memberTypes.length).toEqual(2);
      expect(Target.memberTypes).toContain(t.str);
      expect(Target.memberTypes).toContain(t.bool);
    });

    it('union of single type is collapsed', () => {
      const Target = t.union(t.bool);
      type Target = t.ToTsType<typeof Target>;

      type ExpectedDefinitionType = t.Type<'boolean'>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target).toEqual(t.bool);
    });

    it('union of objects of same shape type are collapsed', () => {
      const ObjA = t.obj({
        prop1: t.str,
        prop2: t.bool
      });
      type ObjA = t.ToTsType<typeof ObjA>;

      const ObjB = t.obj({
        prop1: t.str,
        prop2: t.bool
      });
      type ObjB = t.ToTsType<typeof ObjB>;

      const Target = t.union(ObjA, ObjB);
      type Target = t.ToTsType<typeof Target>;

      type ExpectedDefinitionType = typeof ObjA;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target === ObjA || Target === ObjB).toBeTruthy();
    });

    describe('union of unions', () => {
      it('combines peer unions', () => {
        const Target = t.union(t.union(t.str, t.num), t.union(t.bool, t.bigint));
        type Target = t.ToTsType<typeof Target>;

        type ExpectedDefinitionType = t.UnionType<
          t.Type<'string'> | t.Type<'number'> | t.Type<'boolean'> | t.Type<'bigint'>
        >;
        expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
        expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

        expect(Target.kind).toEqual('union');
        expect(Target.memberTypes.length).toEqual(4);
        expect(Target.memberTypes).toContain(t.str);
        expect(Target.memberTypes).toContain(t.num);
        expect(Target.memberTypes).toContain(t.bool);
        expect(Target.memberTypes).toContain(t.bigint);
      });

      describe('nested unions', () => {
        it('combines depth 1 unions', () => {
          const Target = t.union(t.str, t.union(t.bool, t.bigint));
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<t.Type<'string'> | t.Type<'boolean'> | t.Type<'bigint'>>;
          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target.kind).toEqual('union');
          expect(Target.memberTypes.length).toEqual(3);
          expect(Target.memberTypes).toContain(t.str);
          expect(Target.memberTypes).toContain(t.bool);
          expect(Target.memberTypes).toContain(t.bigint);
        });

        it('combines depth 3 unions', () => {
          const Target = t.union(t.str, t.union(t.bool, t.union(t.num, t.bigint)));
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            t.Type<'string'> | t.Type<'boolean'> | t.Type<'number'> | t.Type<'bigint'>
          >;
          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target.kind).toEqual('union');
          expect(Target.memberTypes.length).toEqual(4);
          expect(Target.memberTypes).toContain(t.str);
          expect(Target.memberTypes).toContain(t.bool);
          expect(Target.memberTypes).toContain(t.num);
          expect(Target.memberTypes).toContain(t.bigint);
        });

        it('collapses duplicates to single type', () => {
          const Target = t.union(t.str, t.union(t.str, t.union(t.str)));
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = t.Type<'string'>;
          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target).toEqual(t.str);
        });
      });
    });
  });

  describe('compressUnion()', () => {
    it('compresses duplicates', () => {
      const target = t.compressUnionMembers([t.str, t.str, t.str]);

      type ExpectedDefinitionType = Array<t.Type<'string'>>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      expect(target.length).toEqual(1);
      expect(target).toContain(t.str);
    });
  });

  describe('type inference', () => {
    // eslint-disable-next-line jest/expect-expect
    it('infers well with obbject hierarchies of unions', () => {
      const Target = t.obj({
        prop: t.str,
        subUnion0: t.union(
          t.obj({
            prop: t.str,
            subUnion00: t.union(t.bool, t.union(t.num, t.bigint))
          }),
          t.obj({
            prop: t.str,
            subUnion01: t.union(t.bool, t.union(t.num, t.bigint))
          })
        )
      });

      type Target = t.ToTsType<typeof Target>;
      type TargetRoundTripped = t.ToDefinitionType<Target>;

      expectTypesSupportAssignment<TargetRoundTripped, typeof Target>();
      expectTypesSupportAssignment<typeof Target, TargetRoundTripped>();
    });
  });
});
