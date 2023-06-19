import * as t from './index';
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
});
