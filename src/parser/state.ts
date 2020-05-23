import { Node } from '../types';

import { Options } from './options';
import { Cursor } from './scan';


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

  handle(cursor: Cursor) {
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

  resetWorking() { this.working = []; }
  addWorkingNode() { this.working.push({code: '', in: [], out: []}); }
  top() { return !this.commentMark && !this.strMark && this.stack.length === 0; }

  finalize() {
    // TODO: check if state can be closed
  }
}
