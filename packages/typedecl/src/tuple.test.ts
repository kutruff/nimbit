import * as t from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Tuples', () => {
  describe('tuple()', () => {
    it('supports instantiated const arrays', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;

      type ExpectedDefinitionType = t.TupleType<[typeof t.string, typeof t.number, typeof t.boolean]>;
      expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
      expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

      expect(Target.kind).toEqual('tuple');
      expect(Target.elementTypes.length).toEqual(3);
      expect(Target.elementTypes).toEqual([t.string, t.number, t.boolean]);
    });
  });

  describe('parse()', () => {
    it('parses a value', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;
      const instance = Target.parse(['a', 1, true]);
      expect(instance.success).toEqual(true);
      if (instance.success) {
        expect(instance.value).toEqual(['a', 1, true]);
      }
    });

    it('fails to parse wrong sized tuple', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;
      const instance = Target.parse(['a', 1]);
      expect(instance.success).toEqual(false);
    });

    it('fails to parse incorrectly typed tuple', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;
      const instance = Target.parse(['a', 1, 'true']);
      expect(instance.success).toEqual(false);
    });
  });
});
