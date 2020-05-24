import { Node } from '../types';

import { Options } from './options';
import { Cursor } from './scan';
import { Refs } from './refs';
import { prep } from './prep';


export class State {
  commentMark: string | undefined = undefined;
  strMark: string | undefined = undefined;
  stack: string[] = [];

  working: Node[] = [];

  constructor(readonly options: Options) {}

  checkComment(cursor: Cursor) {
    if (cursor.current in this.options.commentMap) this.commentMark = cursor.current;
    if (cursor.nextSpan in this.options.commentMap) this.commentMark = cursor.nextSpan;
  }

  checkStr(cursor: Cursor) {
    if (this.options.strMarks.includes(cursor.current)) this.strMark = cursor.current;
  }

  checkStack(cursor: Cursor) {
    if (cursor.current in this.options.stackMap) this.stack.push(cursor.current);
  }

  append(cursor: Cursor) {
    if (!this.working.length) this.addWorkingNode();
    this.working[this.working.length - 1].code += cursor.current;
  }

  public handle(cursor: Cursor) {
    this.append(cursor);
    if (this.commentMark) {
      if (cursor.current === this.options.commentMap[this.commentMark] ||
        (cursor.prevSpan === this.options.commentMap[this.commentMark])) this.commentMark = undefined;
    } else if (this.strMark) {
      if (cursor.current === this.strMark && cursor.prev !== '\\') this.strMark = undefined;
    } else {
      if (this.stack.length > 0) {
        if (cursor.current === this.options.stackMap[this.stack[this.stack.length - 1]]) 
          this.stack.pop();
      }

      this.checkComment(cursor);
      this.checkStr(cursor);
      this.checkStack(cursor);
    }
  }

  public top() { return !this.commentMark && !this.strMark && this.stack.length === 0; }

  public resetWorking() { this.working = []; }
  public addWorkingNode() { this.working.push({code: '', in: [], out: []}); }
  public prepWorking() { this.working = prep(this.working, this.options.prep); }
  public resolveWorkingNode(refs: Refs) {
    if (this.working.length === 0) return;
    const res = refs.resolve(this.working[this.working.length - 1].code.trim());
    if (res) this.working[this.working.length - 1] = res;
  }

  public finalize() {
    // TODO: check if state can be closed
  }
}
