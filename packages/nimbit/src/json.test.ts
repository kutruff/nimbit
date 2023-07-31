/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from '.';
import { json } from './json';

describe('json', () => {
  describe('parse()', () => {
    it.each([
      ['"hello"', 'hello'],
      ['1', 1],
      ['{"a":1}', { a: 1 }],
      ['["hello", 7]', ['hello', 7]]
    ])('parse(%s, %s)', (a: string, expected: any) => {
      const res = t.unknown.safeParse(1);
      expect(res.success).toEqual(true);

      const result = json.safeParse(a);
      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.data).toEqual(expected);
      }
    });
    it.todo('test recrusive json parsing');
  });
});
