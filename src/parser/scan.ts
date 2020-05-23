import { Observable } from 'rxjs';


export interface Cursor {
  current: string;
  next: string;
  prev: string;
  nextSpan: string;
  prevSpan: string;
  pos: {
    line: number;
    char: number;
  };
  skip: () => void;
}


export function scan(code: string) {
  return new Observable<Cursor>(observer => {
    const pos = { line: 1, char: 1 };

    for (let i = 0; i < code.length; i++) {
      const prev = code[i - 1];
      const current = code[i];
      const next = code[i + 1];

      pos.char++;
      if (current === '\n') {
        pos.line++;
        pos.char = 1;
      }

      observer.next({
        pos, prev, current, next,
        nextSpan: current + (next || ''),
        prevSpan: (prev || '') + prev,
        skip: () => i++,
      });
    }

    observer.complete();
  });
}
