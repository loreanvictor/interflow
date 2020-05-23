export interface Node {
  code: string;
  in: Node[];
  out: Node[];
}


export function isNode(n: any): n is Node {
  return n && n.code && typeof n.code === 'string' && Array.isArray(n.in) && Array.isArray(n.out);
}


export interface Flow {
  sources: Node[];
  sinks: Node[];
}


export function isFlow(g: any): g is Flow {
  return g && Array.isArray(g.sources) && Array.isArray(g.sinks);
}
