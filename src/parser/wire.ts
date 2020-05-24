import { Node } from '../types';


export function wire(src: Node[], dest: Node[]) {
  src.forEach(n => n.out = n.out.concat(dest));
  dest.forEach(n => n.in = n.in.concat(src));
}
