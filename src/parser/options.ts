import { PreWire, dropEmpty, trimCode } from './wire';


export interface Options {
  stackMap: {[init: string]: string};
  commentMap: {[init: string]: string};
  strMarks: string[];
  preWire: PreWire[];
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

  preWire: [ dropEmpty, trimCode ]
}
