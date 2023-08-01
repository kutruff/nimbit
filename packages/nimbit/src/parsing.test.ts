/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  any,
  bigint,
  boolean,
  date,
  invalidTypeError,
  never,
  nul,
  number,
  pass,
  string,
  symbol,
  undef,
  unknown
} from '.';
import * as t from '.';
import { expectTypesSupportAssignment } from './test/utilities';

//TODO: refactor parsing tests and account for error conditions.


describe('Object parsing', () => {
  it('parses', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    type Person = t.Infer<typeof Person>;
    const result = Person.safeParse({ name: 'John', age: 10, isActive: true });

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true });
    }
  });

  it('fails when a property fails', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number
    });

    const result = Person.safeParse({ name: 'John', age: '10' } as any);

    expect(result.success).toEqual(false);
  });

  it('fails when properties are missing', () => {
    const Person = t.obj({
      name: t.string,
      age: t.number,
      isActive: t.boolean
    });

    const result = Person.safeParse({ name: 'John', age: 10 } as any);

    expect(result.success).toEqual(false);
  });

  it('strips objects when policy is strip', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.strip
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true });
      expect((result.data as any).extraProperty).toEqual(undefined);
    }
  });

  it('strict parsing fails with extra property', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.strict
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(false);
  });

  it('strict parsing succeeds when just the right number of props', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.strict
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true });
      expect((result.data as any).extraProperty).toEqual(undefined);
    }
  });

  it('passthrough parsing leaves properties not on the shape', () => {
    const Person = t.obj(
      {
        name: t.string,
        age: t.number,
        isActive: t.boolean
      },
      'Person',
      t.PropertyPolicy.passthrough
    );

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' });
    }
  });

  it('catchall handles all unknown properties and ignores whatever policy is set', () => {
    const Person = t
      .obj(
        {
          name: t.string,
          age: t.number,
          isActive: t.boolean
        },
        'Person',
        t.PropertyPolicy.strict
      )
      .catchall(string);

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(true);

    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' });
    }
  });

  it('catchall failures cause all parsing to fail', () => {
    const Person = t
      .obj(
        {
          name: t.string,
          age: t.number,
          isActive: t.boolean
        },
        'Person',
        t.PropertyPolicy.strip
      )
      .catchall(string.where(x => x === 'hello'));

    const result = Person.safeParse({ name: 'John', age: 10, isActive: true, extraProperty: 'extra' } as any);

    expect(result.success).toEqual(false);
  });
});

;
