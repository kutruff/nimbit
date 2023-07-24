/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from '.';

describe('json', () => {
  describe('parse()', () => {
    it.each([
      ['"hello"', 'hello'],
      ['1', 1],
      ['{"a":1}', { a: 1 }],
      ['["hello", 7]', ['hello', 7]]
    ])('parse(%s, %s)', (a: string, expected: any) => {
      const result = t.json.parse(a);
      expect(result.success).toEqual(true);
      if (result.success) {
        expect(result.value).toEqual(expected);
      }
    });
  });
});
