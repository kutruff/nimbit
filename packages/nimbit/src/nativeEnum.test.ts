/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from './index';


describe('Native enums', () => {
  it('supports just string enums', () => {
    enum Fruits {
      Apple = 'apple',
      Banana = 'banana'
    }

    type isNumeric = typeof Fruits extends { [k: string]: string | number } ? true : false;
    type isNumeric2 = typeof Fruits extends { [k: number]: string } ? true : false;

    const FruitEnum = t.nativeEnum('Fruits', Fruits);

    type FruitEnum = t.Infer<typeof FruitEnum>; // Fruits

    FruitEnum.parse(Fruits.Apple); // passes

    FruitEnum.parse('apple'); // passes
    FruitEnum.parse('banana'); // passes
    expect(FruitEnum.safeParse('cantaloupe').success).toEqual(false); // fails
  });

  it('supports mixed enums', () => {
    enum Fruits {
      Apple = 'apple',
      Banana = 'banana',
      Cantaloupe = 0 // you can mix numerical and string enums
    }

    type isNumeric = typeof Fruits extends { [k: string]: string | number } ? true : false;
    type isNumeric2 = typeof Fruits extends { [k: number]: string } ? true : false;

    const FruitEnum = t.nativeEnum('Fruits', Fruits);

    type FruitEnum = t.Infer<typeof FruitEnum>; // Fruits

    FruitEnum.parse(Fruits.Apple); // passes
    FruitEnum.parse(Fruits.Cantaloupe); // passes
    FruitEnum.parse('apple'); // passes
    FruitEnum.parse('banana'); // passes
    FruitEnum.parse(0); // passes
    expect(FruitEnum.safeParse('Cantaloupe').success).toEqual(false); // fails
  });

  it('supports standard numeric enums', () => {
    enum Fruits {
      Apple,
      Banana
    }
    type theType<T> = T[keyof T]
    type Frafe = theType<typeof Fruits>;
    type isNumeric = typeof Fruits extends { [k: string]: string | number } ? true : false;
    type isNumeric2 = typeof Fruits extends { [k: number]: string } ? true : false;
    type fadfaf = keyof typeof Fruits;
    const FruitEnum = t.nativeEnum('Fruits', Fruits);
    type FruitEnum = t.Infer<typeof FruitEnum>; // You don't need to do anything here.t.Infer<typeof FruitEnum>; // Fruits

    FruitEnum.parse(Fruits.Apple); // passes
    FruitEnum.parse(Fruits.Banana); // passes
    FruitEnum.parse(0); // passes
    FruitEnum.parse(1); // passes
    expect(FruitEnum.safeParse(3).success).toEqual(false); // fails
  });

  it('supports as const objects', () => {
    const Fruits = {
      Apple: 'apple',
      Banana: 'banana',
      Cantaloupe: 3
    } as const;

    type theType<T> = T[keyof T]
    type Frafe = theType<typeof Fruits>;
    type isNumeric = typeof Fruits extends { [k: string]: string | number } ? true : false;
    type isNumeric2 = typeof Fruits extends { [k: number]: string } ? true : false;
    const FruitEnum = t.nativeEnum('Fruits', Fruits);
    type FruitEnum = t.Infer<typeof FruitEnum>; // "apple" | "banana" | 3

    FruitEnum.parse('apple'); // passes
    FruitEnum.parse('banana'); // passes
    FruitEnum.parse(3); // passes
    expect(FruitEnum.safeParse('Cantaloupe').success).toEqual(false); // fails
  });
});
