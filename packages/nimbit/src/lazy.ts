import { Typ, type ParseResult } from '.';

export function lazy<T>(definition: () => Typ<unknown, unknown, T>): LazyType<T> {
  return new LazyType<T>(definition);
}

//TODO: add tests
export class LazyType<T> extends Typ<'lazy', () => Typ<unknown, unknown, T>, T> {
  //Note that members and shape are really the same object
  constructor(shape: () => Typ<unknown, unknown, T>, name?: string) {
    super('lazy', shape, name);
  }

  private _subType?: Typ<unknown, unknown, T>;
  public get subType(): Typ<unknown, unknown, T> {
    if (!this._subType) {
      this._subType = this.shape();
    }
    return this._subType;
  }

  safeParse(value: unknown): ParseResult<T> {
    return this.subType.safeParse(value);
  }
}
