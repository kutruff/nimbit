Zod 
* no strongly typed `parse()`
* `intersect()` ceases all additional operations
* no `extract()`, or `exclude()` on general unions
* optionals are special and do supply an unwrap(). 
* introduces ZodEffects whenever there is a refinement