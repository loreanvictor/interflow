import { Node } from '../types';

import { Options } from './options';
import { Cursor } from './scan';
import { Refs } from './refs';
import { prep } from './prep';


enum StackType {
  Normal, Str, Template,
}

export class State {
  commentMark: string | undefined = undefined;
  stack: {mark: string, type: StackType}[] = [];

  working: Node[] = [];

  constructor(readonly options: Options) {}

  checkComment(cursor: Cursor) {
    if (cursor.current in this.options.commentMap) this.commentMark = cursor.current;
    if (cursor.nextSpan in this.options.commentMap) this.commentMark = cursor.nextSpan;
  }

  checkStr(cursor: Cursor) {
    if (this.options.strMarks.includes(cursor.current)) this.stack.push({ mark: cursor.current, type: StackType.Str});
  }

  checkStack(cursor: Cursor) {
    if (cursor.current in this.options.stackMap) this.stack.push({ mark: cursor.current, type: StackType.Normal });
  }

  checkTemplate(cursor: Cursor) {
    const initializers = this.options.strTemplates[this.peek?.mark];
    if (initializers.includes(cursor.current)) this.stack.push({ mark: cursor.current, type: StackType.Template });
    if (initializers.includes(cursor.prevSpan)) this.stack.push({ mark: cursor.prevSpan, type: StackType.Template });
  }

  append(cursor: Cursor) {
    if (!this.working.length) this.addWorkingNode();
    this.working[this.working.length - 1].code += cursor.current;
  }

  get peek() { return this.stack[this.stack.length - 1]; }

  public handle(cursor: Cursor) {
    this.append(cursor);
    if (this.commentMark) {
      if (cursor.current === this.options.commentMap[this.commentMark] ||
        (cursor.prevSpan === this.options.commentMap[this.commentMark])) this.commentMark = undefined;
    } else if (this.peek?.type === StackType.Str) {
      if (cursor.current === this.peek?.mark && cursor.prev !== '\\') this.stack.pop();
      else this.checkTemplate(cursor);
    } else {
      if (this.peek?.type === StackType.Normal) {
        if (cursor.current === this.options.stackMap[this.peek.mark])
          this.stack.pop();
      } else if (this.peek?.type === StackType.Template) {
        if (cursor.current === this.options.templateMap[this.peek.mark])
          this.stack.pop();
      }

      this.checkComment(cursor);
      this.checkStr(cursor);
      this.checkStack(cursor);
    }
  }

  public top() { return !this.commentMark && this.stack.length === 0; }

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
