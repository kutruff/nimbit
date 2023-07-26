/* eslint-disable @typescript-eslint/no-unused-vars */
import * as t from '.';
import { Typ } from '.';

describe('experiments', () => {
  it('does nothing', () => {
    expect(true).toEqual(true);
  });

  // it('parses', () => {

  //   const Person = t.obj({
  //     name: t.string,
  //     age: t.opt(t.number)
  //     // isActive: t.boolean
  //   });

  //   //how to clone keeping prototype
  //   //let clone = Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)

  //   interface Type2StandardOperations<T>{
  //     parse(value: unknown): t.ParseResult<T>;

  //     nullable : Type2StandardOperations<unknown, unknown> | null;
  //   }

  //   interface TypeParser{
  //     parse() : unknown;
  //   }

  //   interface Type2<TKind, T> extends t.Type<unknown, unknown>{
  //     kind: TKind;
  //     parser: TypeParser;
  //     opt(value: unknown): Type2<TKind, T>;

  //     // opt: ;
  //     // nullable : Type2StandardOperations<unknown, unknown> | null;
  //   }

  //   const shape = new Symbol['shape'];
  //   interface ObjType2<TShape> extends Type2<'object', unknown>{
  //     kind: 'object';
  //     shape: TShape;

  //   }
  //   const datelike = t.union([t.number, t.string, t.date]);
  //   const datelikeToDate = t.date.parsedFrom(dateLike);

  //   const datelikeToDateCoerction = t.date.parsedFrom(dateLike);

  //   //transform function has two overloads.  If it doesn't have a type specified, then it will be the same type as the source type.
  //   // In order to change type, a parser must be passed.

  //   const source = t.obj({ prop0: t.number, prop1: t.string, prop3: t.date });
  //   const source3 = t.obj({
  //     prop0: t.number.opt.with(x => x.where(x => x > 10).from(t.union(t.number, t.string, t.date)));
  //     prop1: t.number.with(x => x.from(t.string).where(),
  //     prop3: t.date
  //   });

  //   // const destination = t.obj({ prop0: source.prop0.from(t.string), prop1: t.string, prop3: t.date });

  //   //input and partialInput are the same, except partialInput allows for optional properties.
  //   //input just enforces that the subset of property names match. There's nothing about types in there.
  //   const input = t.input(source, {
  //     prop0: t.date.opt.where(x > 10).parsedFrom(t.string.opt.where(x => x.length > 0)),
  //     prop1: t.string
  //   });

  //   // t.opt -> returns Definition. t.obj collapses it to a property at the end when finally constructing the obj.
  //   // t.opt.where() -> returns Definition. (parser)
  //   // ObjType contains a separate parser field for all the validation and parsing instructions.

  //   const mapped = source.map(({prop0, prop1, ...rest}) => ({
  //     prop0: prop0.where(x > 10).from(t.string.opt.where(x => x.length > 0)),
  //     prop1: prop1.from(t.string)
  //   }));

  //   const Person, PersonParser = t.obj({
  //     name: t.string.nullable,
  //     age: t.opt(t.number)
  //   });

  //   const PersonParser = t.obj({
  //     name: t.string,
  //     age: t.opt(t.number)
  //   });

  //   //would do source.prop0.from(input.prop0) (can use a proxy to get destructured properties... tricky but hacky)
  //   t.intersection(source.pickAndMap(input, x => x.from), source.pick(({prop0, prop1}) => void));

  //   const parsed = source.parsedFrom(input).parse({ prop0: '1', prop1: '2' });

  //   //Type.unvalidated returns the end data type.
  //   //Typ.coerce is a property that is the same as from(t.any)
  //   const newWay = [
  //     t.number.coerce.transform(x => x + 1, t.number),
  //     t.number
  //       .transform(x => x + 1)
  //       .where(x => x > 0)
  //       .from(t.string),
  //     t.number.parsedFrom(t.any),
  //     t.number.transform(x => x + 1, t.number).from(t.any),
  //     t.number.parsedFrom(t.any).transform(x => x + 1, t.number),
  //     t.union(t.number.parsedFrom(t.string), t.string.parsedFrom(t.number)),
  //     t.number.parsedFrom(t.string).transform(x => x + 1, t.number),
  //     t.number.coerce.from(t.union(t.string, t.string.parsedFrom(t.number)))
  //   ];
  //   const newWay2 = [t.number.coerce(t.coerce), t.union(t.number.parsedFrom(t.string), t.string.parsedFrom(t.number))];
  //   const zodWay = [
  //     z
  //       .string()
  //       .pipe(z.coerce.number())
  //       .transform(x => x + 1)
  //   ];
  //   const zodWay2 = [
  //     z.coerce.string(),
  //     t.union(z.coerce.number(), z.coerce.number()),
  //     z.string().transform(x => x.length)
  //   ];
  //   type Person = t.Infer<typeof Person>;
  //   const result = Person.parse({ name: 'John', age: 10, isActive: true });
  //   expect(result.success).toEqual(true);

  //   if (result.success) {
  //     expect(result.value).toEqual({ name: 'John', age: 10 });
  //     // expect(result.value).toEqual({ name: 'John', age: 10, isActive: true });
  //     // expectTypesSupportAssignment<(typeof result)['value'], { name: string; age?: number; isActive: boolean }>();
  //     // expectTypesSupportAssignment<{ name: string; age?: number; isActive: boolean }, (typeof result)['value']>();
  //   }
  // });

  describe('tuple()', () => {
    it('supports instantiated const arrays', () => {
      // export const YesNo = t.union(t.literal('YES'), t.literal('NO'));
      const YesNo = t.enumm('yes_or_no', ['YES', 'NO']);
      type YesNo = t.Infer<typeof YesNo>;

      //https://www.postgresql.org/docs/current/infoschema-tables.html
      const Tables = t.obj(
        {
          table_catalog: t.string, //'postgres', //name
          table_schema: t.string, //'planner', //name
          table_name: t.string, //'User', //name
          table_type: t.string, //'BASE TABLE',
          self_referencing_column_name: t.string, //null,
          reference_generation: t.string, //null,
          user_defined_type_catalog: t.string, //null,
          user_defined_type_schema: t.string, //null,
          user_defined_type_name: t.string, // null,
          is_insertable_into: t.string, //yesNo//'YES',
          is_typed: t.string, //yesNo//'NO',
          commit_action: t.string //null
        },
        'tables'
      );

      // const DatabaseParser = t.parser(Tables, {
      //   is_insertable_into: YesNo.nullable,
      // });

      //TODO: is this branded types or not?
      // const timpestamptz = t.cloneObject(t.date);
      // timpestamptz.name = 'timestampz';

        //Typ<'date', Date, Date>('date', 'timestampz');

      // const stringToDate = t.createConverter(t.string, t.date, value => new Date(value));
      // const dateToString = t.createConverter(t.date, t.string, value => value.toISOString());

      // const Event = t.obj(
      //   {
      //     id: t.string, //'postgres',
      //     content: t.string, //'postgres',
      //     created_at: timpestamptz //null
      //   },
      //   'tables'
      // );
      // type Event = t.Infer<typeof Event>;

      // export const TablesParser = t.parser(Tables, {
      //   table_name: Tables.shape.table_name.type
      // });

      // interface TypeParser<T> extends t.Type<T, unknown>{
      // }

      class FluentType<T extends t.Type<unknown, unknown>> {
        constructor(public type: T) {}

        parse<TDestination extends t.Type<unknown, unknown>>(destinationType: TDestination): t.Infer<TDestination> {
          return {} as t.Infer<TDestination>;
        }
      }

      // const string = t.string;
      //  function fluentify(obj: any) {

      // }

      //  function validated<TSource extends t.Type<unknown, unknown>>(type: TSource, validator: (value: t.Infer<TSource>) => boolean){
      //   return {
      //     ...type,
      //     validators: [...(type as any).validators, validator],
      //   }
      // }

      // interface Type2 {
      //   previousInParseChain?: Type2;
      // }
    });
  });
});
