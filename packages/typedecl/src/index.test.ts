/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from './index';

describe('Type declaration', () => {
  describe('Arrays', () => {
    it('allows simple arrays', () => {
      const arrayOfNumbers = t.array(t.number);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(t.string)
      });
      type ObjectWithArray = t.ToTsType<typeof ObjectWithArray>;
      type ObjectWithArrayDefinitionFromShape = t.ToShapeType<ObjectWithArray>;
      const instance: ObjectWithArray = {
        anArrayProp: ['foo', 'bar']
      };
    });

    it('allows arrays of objects', () => {
      const arrayOfNumbers = t.array(t.number);

      const ObjectWithArray = t.obj({
        anArrayProp: t.array(
          t.obj({
            someProp: t.string
          })
        )
      });
      type ObjectWithArray = t.ToTsType<typeof ObjectWithArray>;
      type ObjectWithArrayDefinitionFromShape = t.ToShapeType<ObjectWithArray>;
      const instance: ObjectWithArray = {
        anArrayProp: [{ someProp: 'foo' }, { someProp: 'bar' }]
      };
    });
  });
});
