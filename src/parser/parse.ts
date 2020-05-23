import { Observable } from 'rxjs';

import { Node, Flow } from '../types';
import { Cursor, scan } from './scan';
import { Options, DefaultOptions } from './options';
import { wire, applyPre } from './wire';
import { State } from './state';


export function parse(
  source: string | Observable<Cursor>,
  options: Options = DefaultOptions
): Observable<Flow> {
  if (typeof source === 'string') return parse(scan(source), options);

  return new Observable<Flow>(observer => {
    const state = new State(options);
    let last: Node[] = [];
    let first: Node[] = [];

    return source.subscribe(cursor => {
      if (state.top()) {
        if (cursor.current === ',') {
          return state.addWorkingNode();
        } else if (cursor.nextSpan === '->') {
          if (state.working.length === 0) throw Error('syntax error!'); //TODO: replace with proper error

          cursor.skip();

          if (last.length > 0) wire(last, state.working, options.preWire);
          else first = applyPre(state.working, options.preWire);

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

      state.finalize();
      wire(last, state.working);

      observer.next({
        sources: first,
        sinks: state.working
      });

      observer.complete();
    });
  });
}
