import { Node } from '../types';


export type PreWire = (nodes: Node[]) => Node[] | undefined | void;


export function wire(src: Node[], dest: Node[], pre: PreWire[] = []) {
  dest = applyPre(dest, pre);

  src.forEach(n => n.out = dest);
  dest.forEach(n => n.in = src);
}


export function dropEmpty(nodes: Node[]) {
  return nodes.filter(node => node.code.trim().length > 0);
}


export function trimCode(nodes: Node[]) {
  nodes.forEach(node => node.code = node.code.trim());
}


export function applyPre(nodes: Node[], pre: PreWire[]) {
  return pre.reduce((nodes, pw) => pw(nodes) || nodes, nodes);
}
