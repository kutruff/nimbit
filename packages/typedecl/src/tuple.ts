import { type TupleType, type Type } from '.';

export function tuple<TTuple extends [Type<unknown, unknown>, ...Type<unknown, unknown>[]]>(
  values: TTuple
): TupleType<typeof values> {
  return {
    kind: 'tuple',
    elementTypes: values
  };
}
