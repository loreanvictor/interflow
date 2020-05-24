import { Node } from '../types';


export type PrepFunc = (nodes: Node[]) => Node[] | undefined | void;


export function dropEmpty(nodes: Node[]) {
  return nodes.filter(node => node.code.trim().length > 0);
}


export function trimCode(nodes: Node[]) {
  nodes.forEach(node => node.code = node.code.trim());
}


export function prep(nodes: Node[], pre: PrepFunc[]) {
  return pre.reduce((nodes, pw) => pw(nodes) || nodes, nodes);
}
