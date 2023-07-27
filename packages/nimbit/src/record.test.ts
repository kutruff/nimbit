/* eslint-disable @typescript-eslint/no-explicit-any */

import * as t from '.';

describe('RecordType', () => {
  it('can be created', () => {
    const Target = t.record(t.string, t.number);
    type Target = t.Infer<typeof Target>;
    // type Target = t.TsType<typeof Target>;

    expect(Target.kind).toEqual('record');
    expect(Target.key).toEqual(t.string);
    expect(Target.value).toEqual(t.number);
  });

  it('parse works', () => {
    const Target = t.record(t.string, t.number);
    type Target = t.Infer<typeof Target>;
    const instance: Target = { hello: 2, yes: 3 };

    const result = Target.safeParse(instance);
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.data).toEqual(instance);
    }
  });

  it('parse fails when keys are not correct types', () => {
    const Target = t.record(t.string, t.number);
    type Target = t.Infer<typeof Target>;
    const testSymbol = Symbol('SymbolT');
    const instance = { [testSymbol]: 2, yes: 3 };
    const result = Target.safeParse(instance as any);
    expect(result.success).toEqual(false);
  });

  it('parse fails when values are not correct types bigint', () => {
    const Target = t.record(t.string, t.number);
    type Target = t.Infer<typeof Target>;
    const instance = { hello: 2, yes: '1' };
    const result = Target.safeParse(instance as any);
    expect(result.success).toEqual(false);
  });
});
