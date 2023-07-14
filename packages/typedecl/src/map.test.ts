/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';

describe('MapType', () => {
  it('can be created', () => {
    const Target = t.map(t.string, t.number);
    type Target = t.Infer<typeof Target>;
    // type Target = t.TsType<typeof Target>;
    const instance: Target = new Map<string, number>([['hello', 2]]);
    expect(Target.kind).toEqual('map');
    expect(Target.key).toEqual(t.string);
    expect(Target.value).toEqual(t.number);
  });

  it('parse works', () => {
    const Target = t.map(t.string, t.number);
    type Target = t.TsType<typeof Target>;
    const instance: Target = new Map<string, number>([
      ['hello', 2],
      ['yes', 2]
    ]);
    const result = Target.parse(instance);
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(instance);
    }
  });

  it('parse fails when keys are not correct types', () => {
    const Target = t.map(t.string, t.string);
    type Target = t.TsType<typeof Target>;
    const instance = new Map<number, string>([
      [2, 'hello'],
      [3, 'yes']
    ]);
    const result = Target.parse(instance as any);
    expect(result.success).toEqual(false);
  });

  it('parse fails when values are not correct types', () => {
    const Target = t.map(t.string, t.bigint);
    type Target = t.TsType<typeof Target>;
    const instance = new Map<number, string>([
      [2, 'hello'],
      [3, 'yes']
    ]);
    const result = Target.parse(instance as any);
    expect(result.success).toEqual(false);
  });
});
