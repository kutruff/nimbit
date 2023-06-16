import * as t from '.';
import { expectTypesSupportAssignment } from './test/utilities';

describe('objClass()', () => {
  it('allows self recursion', () => {
    class ADef {
      self = ADef;
    }

    const A = t.objFromClass(ADef);
    type A = t.ToTsType<typeof A>;

    expect(A.shape.self.type).toEqual(A);

    type ExpectedAShape = { self: A };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();
  });

  it('allows mutual recursion', () => {
    class ADef {
      b = BDef;
    }

    class BDef {
      a = ADef;
    }

    const A = t.objFromClass(ADef);
    type A = t.ToTsType<typeof A>;

    const B = t.objFromClass(BDef);
    type B = t.ToTsType<typeof B>;

    expect(A.shape.b.type).toEqual(B);
    expect(B.shape.a.type).toEqual(A);

    type ExpectedAShape = { b: B };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();

    type ExpectedBShape = { a: A };
    expectTypesSupportAssignment<ExpectedBShape, B>();
    expectTypesSupportAssignment<B, ExpectedBShape>();
  });

  it('supports self references with arrays', () => {
    class ADef {
      children = t.array(t.objFromClass(ADef));
    }

    const A = t.objFromClass(ADef);
    type A = t.ToTsType<typeof A>;

    expect(A.shape.children.type.elementType).toEqual(A);

    type ExpectedAShape = { children: A[] };
    expectTypesSupportAssignment<ExpectedAShape, A>();
    expectTypesSupportAssignment<A, ExpectedAShape>();

  });
});
