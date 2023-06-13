export const expectTypesSupportAssignment = <A, B extends A>() => {
    const assigned_B_To_A: A = {} as B;
    return assigned_B_To_A;
};