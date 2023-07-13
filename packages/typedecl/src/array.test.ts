/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';

describe('Type declaration', () => {
  describe('Arrays', () => {
    it('allows simple arrays', () => {
      const ArrayOfNumbers = t.array(t.number);
      type ArrayOfNumbers = t.Infer<typeof ArrayOfNumbers>;
      const instance: ArrayOfNumbers = [1, 2];
      expect(ArrayOfNumbers.kind).toEqual('array');
      expect(ArrayOfNumbers.value).toEqual(t.number);
    });

    it('allows arrays as members', () => {
      const ObjectWithArray = t.obj({
        anArrayProp: t.array(t.string)
      });
      type ObjectWithArray = t.Infer<typeof ObjectWithArray>;
      const instance: ObjectWithArray = {
        anArrayProp: ['foo', 'bar']
      };
      expect(ObjectWithArray.shape.anArrayProp.kind).toEqual('array');
      expect(ObjectWithArray.shape.anArrayProp.value).toEqual(t.string);
    });

    it('allows arrays of objects', () => {
      const ObjectWithArray = t.obj({
        anArrayProp: t.array(
          t.obj({
            someProp: t.string
          })
        )
      });
      type ObjectWithArray = t.Infer<typeof ObjectWithArray>;

      const instance: ObjectWithArray = {
        anArrayProp: [{ someProp: 'foo' }, { someProp: 'bar' }]
      };

      expect(ObjectWithArray.shape.anArrayProp.value).toEqual(
        t.obj({
          someProp: t.string
        })
      );
    });
  });
});
