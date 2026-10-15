export interface RoadNode {
  id: number
  gx: number
  gz: number
  x: number
  z: number
}

export interface RoadEdge {
  id: number
  from: number
  to: number
  axis: 'x' | 'z'
  length: number
  width?: number
}

export interface RoadGraph {
  nodes: RoadNode[]
  edges: RoadEdge[]
}
