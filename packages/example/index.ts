import { fail, number, obj, pass, string } from 'nimbit';

// export interface AugmentedParseError {
//   kind: 'augmented';
//   what: string;
// }

// export type AugmentedParseError = {
//   kind: 'augmented';
//   what: string;
// };

function augmentedError(what: string) {
  return { kind: 'augmented', what } as const;
}
type AugmentedParseError = ReturnType<typeof augmentedError>;

declare module 'nimbit' {
  // Where you define MessageTypes
  interface ParseErrorTypes {
    Augmented: ReturnType<typeof augmentedError>;
  }
}

export function main() {
  console.log(number.safeParse(123));
  const numberThrowing = number.to(
    string,
    x => {
      throw x;
    },
    value => ({ kind: 'augmented' as const, what: 'one' })
  );

  console.log(numberThrowing.safeParse(1));

  const withWhere = number.where(x => x > 10);

  console.log(withWhere.safeParse(1));

  const tweaked = number.tweak(x => x + 1);
  console.log(tweaked.safeParse(1));

  const madeOpt = number.opt();
  madeOpt.parse(undefined);

  const Person = obj({
    name: string
  });

  console.log(
    number
      .where(
        x => x > 10,
        value => ({ kind: 'augmented' as const, what: `${value} failed` })
      )
      .safeParse(1)
  );

  console.log(
    number.to(number, x => (x > 10 ? pass(x) : fail({ kind: 'augmented' as const, what: 'two' }))).safeParse(1)
  );
  console.log(number.to(number, x => fail({ kind: 'augmented' as const, what: 'three' })).safeParse(1));
}

main();
