import { PrepFunc, dropEmpty, trimCode } from './prep';
import { Refs } from './refs';


export interface Options {
  stackMap: {[init: string]: string};
  commentMap: {[init: string]: string};
  strMarks: string[];
  strTemplates: {[init: string]: string[]};
  templateMap: {[init: string]: string};
  prep: PrepFunc[];
  refs?: Refs;
}


export const DefaultOptions: Options = {
  stackMap: {
    '{': '}',
    '(': ')',
    '[': ']',
  },
  
  commentMap: {
    '//': '\n',
    '/*': '*/',
  },
  
  strMarks: ['"', '`', "'"],

  strTemplates: {
    '`': ['${']
  },

  templateMap: {
    '${': '}'
  },

  prep: [ dropEmpty, trimCode ]
}
