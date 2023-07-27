import { Typ, type ParseResult } from '.';

export function lazy<T>(definition: (x: T) => unknown): LazyType<T> {
  return new LazyType(definition as any);
}

export class LazyType<T> extends Typ<'lazy', () => Typ<unknown, unknown, T>, T> {
  //Note that members and shape are really the same object
  constructor(public subTypeMaker: () => Typ<unknown, unknown, T>, name?: string) {
    super('lazy', subTypeMaker, name);
  }

  private _subType?: Typ<unknown, unknown, T>;
  public get subType(): Typ<unknown, unknown, T> {
    if (!this._subType) {
      this._subType = this.subTypeMaker();
    }
    return this._subType;
  }

  safeParse(value: unknown, opts = Typ.defaultOpts): ParseResult<T> {
    return this.subType.safeParse(value, opts);
  }
}
