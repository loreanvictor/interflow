import { Observable } from 'rxjs';
import { Cursor, scan } from './scan';
import { Refs } from './refs';
import { Node } from '../types';


export function define(source: string, refs: Refs): Observable<Node>;
export function define(source: Observable<Cursor>, refs: Refs): Observable<Node>;
export function define(refs: Refs): (o: Observable<Cursor>) => Observable<Node>;

export function define(
  source: string | Observable<Cursor> | Refs,
  refs?: Refs,
): Observable<Node> | ((o: Observable<Cursor>) => Observable<Node>) {
  if (typeof source === 'string') return define(scan(source), refs as Refs);
  if (!(source instanceof Observable)) return (o: Observable<Cursor>) => define(o, source);

  return new Observable<Node>(observer => {
    let ref = '';
    let node: Node;

    return source.subscribe(cursor => {
      if (node) {
        node.code += cursor.current;
      } else {
        if (cursor.current === '=') {
          ref = ref.trim();
          node = { code: '', in: [], out: [] };
        } else {
          ref += cursor.current;
        }
      }
    },
    err => observer.error(err),
    () => {
      if (!node) throw Error('Some shit happened ...'); // TODO: proper error
      refs?.define(ref, node);
      observer.next(node);
      observer.complete();
    })
  });
}
