import { Observable } from 'rxjs';

import { Node } from '../types';
import { Cursor, scan } from './scan';
import { Options, DefaultOptions } from './options';
import { wire } from './wire';
import { State } from './state';


export function connect(source: string, options?: Options): Observable<Node>;
export function connect(source: Observable<Cursor>, options?: Options): Observable<Node>;
export function connect(options: Options): (o: Observable<Cursor>) => Observable<Node>;

export function connect(
  source: string | Options | Observable<Cursor>,
  options: Options = DefaultOptions,
): Observable<Node> | ((o: Observable<Cursor>) => Observable<Node>) {
  if (typeof source === 'string') return connect(scan(source), options);
  if (!(source instanceof Observable)) return (o: Observable<Cursor>) => connect(o, source);

  return new Observable<Node>(observer => {
    const state = new State(options);
    let last: Node[] = [];

    return source.subscribe(cursor => {
      if (state.top()) {
        if (cursor.current === ',') {
          if (options.refs) state.resolveWorkingNode(options.refs);
          return state.addWorkingNode();
        } else if (cursor.nextSpan === '->') {
          if (state.working.length === 0) throw Error('syntax error!'); //TODO: replace with proper error

          cursor.skip();
          if (options.refs) state.resolveWorkingNode(options.refs);

          state.prepWorking();

          if (last.length > 0) {
            wire(last, state.working);
          }

          state.working.forEach(node => observer.next(node));
          last = state.working;
          return state.resetWorking();
        }
      }

      return state.handle(cursor);
    },
    err => observer.error(err),
    () => {
      if (state.working.length === 0 || last.length === 0)
        throw Error('Syntax Error!'); //TODO: replace with proper error

      if (options.refs) state.resolveWorkingNode(options.refs);

      state.prepWorking();
      state.finalize();

      wire(last, state.working);
      state.working.forEach(node => observer.next(node));

      observer.complete();
    });
  });
}
