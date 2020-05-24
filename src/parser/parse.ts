import { Observable, Subject, Subscription } from 'rxjs';

import { Node } from '../types';
import { Cursor, scan } from './scan';
import { State } from './state';
import { connect } from './connect';
import { Options, DefaultOptions } from './options';
import { Refs } from './refs';
import { define } from './define';


export function parse(source: string, options?: Options): Observable<Node>;
export function parse(source: Observable<Cursor>, options?: Options): Observable<Node>;
export function parse(options: Options): (o: Observable<Cursor>) => Observable<Node>;

export function parse(
  source: string | Options | Observable<Cursor>,
  options: Options = DefaultOptions,
): Observable<Node> | ((o: Observable<Cursor>) => Observable<Node>) {
  if (typeof source === 'string') return parse(scan(source), options);
  if (!(source instanceof Observable)) return (obs: Observable<Cursor>) => parse(obs, source);

  return new Observable<Node>(observer => {
    const opts = { ...options, refs: options.refs || new Refs() };

    const state = new State(options);

    let delegate = new Subject<Cursor>();
    let inner: Subscription | undefined;

    return source.subscribe(cursor => {
      if (state.top() && cursor.current === ';') {
        if (!inner) throw Error('WAAAA?');  // TODO: proper error

        delegate.complete();
        inner.unsubscribe();
        inner = undefined;
        delegate = new Subject<Cursor>();

        return;
      }

      if (!inner) {
        if (/\s/.test(cursor.current)) return;
        if (cursor.current === '#') {
          inner = define(delegate, opts.refs).subscribe(
            node => observer.next(node),
            err => observer.error(err),
          );
          return;
        } else {
          inner = connect(delegate, opts).subscribe(
            node => observer.next(node),
            err => observer.error(err),
          );
        }
      }

      delegate.next(cursor);
      return state.handle(cursor);
    },
    err => observer.error(err),
    () => {
      if (inner) delegate.complete();

      observer.complete();
    });
  });
}
