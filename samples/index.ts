import { last } from 'rxjs/operators';

import { parse } from '../src';


const code = `
# a = h;


@a -> b -> c;
d, @a -> e;
f -> g -> @a;
`

parse(code).pipe(last()).subscribe(node => {
  console.log(node.out);
});
