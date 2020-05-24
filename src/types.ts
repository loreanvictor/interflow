export interface Node {
  code: string;
  ref?: string;
  in: Node[];
  out: Node[];
}


export function isNode(n: any): n is Node {
  return n && n.code && typeof n.code === 'string' && Array.isArray(n.in) && Array.isArray(n.out);
}


export interface Flow {
  sources: Node[];
  sinks: Node[];
  nodes: [];
}


export function isFlow(f: any): f is Flow {
  return f && Array.isArray(f.sources) && Array.isArray(f.sinks) && Array.isArray(f.nodes);
}
