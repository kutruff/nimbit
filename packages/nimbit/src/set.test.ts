/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';

describe('SetType', () => {
  it('can be created', () => {
    const Target = t.set(t.string);
    type Target = t.Infer<typeof Target>;
    const instance: Target = new Set<string>(['hello']);
    expect(Target.kind).toEqual('set');
    expect(Target.value).toEqual(t.string);
    const Container = t.obj({
      setProp: t.set(t.string)
    });
    type Container = t.Infer<typeof Container>;
  });

  it('parse works', () => {
    const Target = t.set(t.string);
    type Target = t.Infer<typeof Target>;

    const instance: Target = new Set<string>(['hello', 'world']);
    const result = Target.parse(instance);
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(instance);
    }
  });
  
  it('parse fails when values are not correct types', () => {
    const Target = t.set(t.string);
    type Target = t.Infer<typeof Target>;

    const instance = new Set<number>([1, 2]);

    const result = Target.parse(instance as any);
    expect(result.success).toEqual(false);
  });
});
