import * as t from '.';
import { expectType, type TypeEqual } from './test/utilities';

describe('literal', () => {
  it('can be created', () => {
    const Target = t.literal('hello');
    type Target = t.Infer<typeof Target>;

    expectType<TypeEqual<Target, 'hello'>>(true);

    expect(Target.kind).toEqual('literal');
    expect(Target.value).toEqual('hello');
  });

  it('parses valid values', () => {
    const Target = t.literal('hello');
    const result = Target.parse('hello');
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual('hello');
    }
  });

  it('rejects invalid values', () => {
    const Target = t.literal('hello');
    const result = Target.parse('world');
    expect(result.success).toEqual(false);
  });

  it('supports numbers', () => {
    const Target = t.literal(1);
    type Target = t.Infer<typeof Target>;

    expectType<TypeEqual<Target, 1>>(true);

    expect(Target.kind).toEqual('literal');
    expect(Target.value).toEqual(1);
  });

  it('supports booleans', () => {
    const Target = t.literal(true);
    type Target = t.Infer<typeof Target>;
    expectType<TypeEqual<Target, true>>(true);

    expect(Target.kind).toEqual('literal');
    expect(Target.value).toEqual(true);
  });


  it('parses valid number literals', () => {
    const Target = t.literal(1);
    const result = Target.parse(1);
    
    type Target = t.Infer<typeof Target>;
    expectType<TypeEqual<Target, 1>>(true);

    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(1);
    }
  });

  it('rejects invalid number literals', () => {
    const Target = t.literal(1);
    const result = Target.parse(2);
    expect(result.success).toEqual(false);

    const stringResult = Target.parse('2');
    expect(stringResult.success).toEqual(false);
  });

  it('parses valid bigint literals', () => {
    const Target = t.literal(1n);
    const result = Target.parse(1n);
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(1n);
    }
  });

  it('rejects invalid bigint literals', () => {
    const Target = t.literal(10n);
    const result = Target.parse(2);
    expect(result.success).toEqual(false);

    const stringResult = Target.parse('10n');
    expect(stringResult.success).toEqual(false);
  });

  it('parses valid Symbol literals', () => {
    const symbol = Symbol('terrific')
    const Target = t.literal(symbol);
    const result = Target.parse(symbol);
    expect(result.success).toEqual(true);
    if (result.success) {
      expect(result.value).toEqual(symbol);
    }
  });
});
