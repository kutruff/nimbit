import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Unions of types', () => {
  describe('union()', () => {
    it('combines simple primitives', () => {
      const Target = t.union(t.string, t.boolean);
      type Target = t.ToTsType<typeof Target>;

      type ExpectedDefinitionType = t.UnionType<t.Type<'string', string> | t.Type<'boolean', boolean>>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target.kind).toEqual('union');
      expect(Target.memberTypes.length).toEqual(2);
      expect(Target.memberTypes).toContain(t.string);
      expect(Target.memberTypes).toContain(t.boolean);
    });

    it('union of single type is collapsed', () => {
      const Target = t.union(t.boolean);
      type Target = t.ToTsType<typeof Target>;

      type ExpectedDefinitionType = t.Type<'boolean', boolean>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target).toEqual(t.boolean);
    });

    it('union of objects of same shape type are collapsed', () => {
      const ObjA = t.obj({
        prop1: t.string,
        prop2: t.boolean
      });
      type ObjA = t.ToTsType<typeof ObjA>;

      const ObjB = t.obj({
        prop1: t.string,
        prop2: t.boolean
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
        const Target = t.union(t.union(t.string, t.number), t.union(t.boolean, t.bigint));
        type Target = t.ToTsType<typeof Target>;

        type ExpectedDefinitionType = t.UnionType<
          t.Type<'string', string> | t.Type<'number', number> | t.Type<'boolean', boolean> | t.Type<'bigint', bigint>
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
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            t.Type<'string', string> | t.Type<'boolean', boolean> | t.Type<'bigint', bigint>
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
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = t.UnionType<
            t.Type<'string', string> | t.Type<'boolean', boolean> | t.Type<'number', number> | t.Type<'bigint', bigint>
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

        it('collapses duplicates to single type', () => {
          const Target = t.union(t.string, t.union(t.string, t.union(t.string)));
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = t.Type<'string', string>;
          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target).toEqual(t.string);
        });

        it('collapses entire union when there is a nested AnyType', () => {
          const Target = t.union(t.string, t.union(t.boolean, t.any));
          type Target = t.ToTsType<typeof Target>;

          type ExpectedDefinitionType = typeof t.any;
          expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
          expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

          expect(Target).toEqual(t.any);
        });
      });
    });

    it('union with any is always collapsed', () => {
      const Target = t.union(t.boolean, t.any);
      type Target = t.ToTsType<typeof Target>;

      type ExpectedDefinitionType = typeof t.any;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target).toEqual(t.any);
    });
  });

  describe('compressUnion()', () => {
    it('compresses duplicates', () => {
      const target = t.compressUnionMembers([t.string, t.string, t.string]);

      type ExpectedDefinitionType = Array<t.Type<'string', string>>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof target>();
      expectTypesSupportAssignment<typeof target, ExpectedDefinitionType>();

      expect(target.length).toEqual(1);
      expect(target).toContain(t.string);
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
            subUnion01: t.union(t.boolean, t.union(t.number, t.bigint))
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
