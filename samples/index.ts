import { last } from 'rxjs/operators';

import { parse } from '../src';


const code = 'a -> `b ${`,`} c` -> d';


parse(code).subscribe(node => {
  console.log(node.code);
});
