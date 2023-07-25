import * as t from './index';
import { expectTypesSupportAssignment } from './test/utilities';

describe('Enums', () => {
  it('supports instantiated const arrays', () => {
    const values = ['a', 'b', 'c'] as const;
    const Target = t.enumm('Target', values);
    type Target = t.Infer<typeof Target>;

    type TargetTupleType = ['a', 'b', 'c'];
    type ExpectedDefinitionType = t.EnumType<TargetTupleType, t.MapOfTupleKeys<TargetTupleType>>;
    expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
    expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

    expect(Target.kind).toEqual('enum');
    expect(Target.name).toEqual('Target');
    expect(Target.shape.length).toEqual(3);
    expect(Target.shape).toEqual(['a', 'b', 'c']);
    expect(Target.enum).toEqual({ a: 'a', b: 'b', c: 'c' });
  });

  it('supports values as function arguments', () => {
    const Target = t.enumm('Target', ['a', 'b', 'c']);
    type Target = t.Infer<typeof Target>;

    type TargetTupleType = ['a', 'b', 'c'];
    type ExpectedDefinitionType = t.EnumType<TargetTupleType, t.MapOfTupleKeys<TargetTupleType>>;
    expectTypesSupportAssignment<ExpectedDefinitionType, typeof Target>();
    expectTypesSupportAssignment<typeof Target, ExpectedDefinitionType>();

    expect(Target.kind).toEqual('enum');
    expect(Target.name).toEqual('Target');
    expect(Target.shape.length).toEqual(3);
    expect(Target.shape).toEqual(['a', 'b', 'c']);
    expect(Target.enum).toEqual({ a: 'a', b: 'b', c: 'c' });
  });
});
