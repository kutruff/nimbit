/* eslint-disable @typescript-eslint/no-explicit-any */

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
      expect(Target.elements.length).toEqual(3);
      expect(Target.elements).toEqual([t.string, t.number, t.boolean]);
    });
  });

  describe('parse()', () => {
    it('parses a value', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;
      const instance = Target.safeParse(['a', 1, true]);
      expect(instance.success).toEqual(true);
      if (instance.success) {
        expect(instance.data).toEqual(['a', 1, true]);
      }
    });

    it('parses a value with an object', () => {
      const Target = t.tuple([
        t.string, // name
        t.number, // jersey number
        t.obj({
          pointsScored: t.number
        }) // statistics
      ]);
      type Target = t.Infer<typeof Target>;
      const instance = Target.safeParse(['a', 1, { pointsScored: 1231 }]);
      expect(instance.success).toEqual(true);
      if (instance.success) {
        expect(instance.data).toEqual(['a', 1, { pointsScored: 1231 }]);
      }
    });

    it('fails to parse wrong sized tuple', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;
      // const shouldNotCompile = Target.safeParse(['a', 1] );
      const instance = Target.safeParse(['a', 1] as any);
      expect(instance.success).toEqual(false);
    });

    it('fails to parse incorrectly typed tuple', () => {
      const Target = t.tuple([t.string, t.number, t.boolean]);
      type Target = t.Infer<typeof Target>;
      const instance = Target.safeParse(['a', 1, 'true'] as any);
      expect(instance.success).toEqual(false);
    });
  });
});
