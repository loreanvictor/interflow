import { Node } from '../types';


export class Refs {
  private map: {[ref: string]: Node} = {};

  public define(ref: string, node: Node) {
    if (ref in this.map) throw Error('Already Defined!'); // TODO: better error
    this.map[ref] = node;
  }

  public resolve(ref: string) {
    if (ref[0] === '@') {
      ref = ref.substr(1);
      if (ref in this.map) return this.map[ref];
      else throw Error('Not Found Var!'); // TODO: better error
    }
    return undefined;
  }
}
