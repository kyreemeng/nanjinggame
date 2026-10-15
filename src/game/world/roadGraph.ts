import * as THREE from 'three'
import type { RoadEdge, RoadGraph, RoadNode } from './roadGraphTypes'

let cached: RoadGraph | null = null
let sidewalkLoops: THREE.Vector3[][] = []

export function setActiveRoadGraph(graph: RoadGraph): void {
  cached = graph
}

export function setSidewalkLoops(loops: THREE.Vector3[][]): void {
  sidewalkLoops = loops
}

export function getRoadGraph(): RoadGraph {
  if (!cached) {
    throw new Error('Road graph not loaded — Nanjing map must load before gameplay')
  }
  return cached
}

export type { RoadEdge, RoadGraph, RoadNode } from './roadGraphTypes'

export function edgeEndpoints(graph: RoadGraph, edge: RoadEdge): { a: RoadNode; b: RoadNode } {
  return {
    a: graph.nodes[edge.from],
    b: graph.nodes[edge.to],
  }
}

export function positionOnEdge(graph: RoadGraph, edge: RoadEdge, t: number): THREE.Vector3 {
  const { a, b } = edgeEndpoints(graph, edge)
  const clamped = Math.max(0, Math.min(1, t))
  return new THREE.Vector3(
    a.x + (b.x - a.x) * clamped,
    0.35,
    a.z + (b.z - a.z) * clamped,
  )
}

export function yawOnEdge(graph: RoadGraph, edge: RoadEdge): number {
  const { a, b } = edgeEndpoints(graph, edge)
  return Math.atan2(b.x - a.x, b.z - a.z)
}

export function edgesNearPoint(
  graph: RoadGraph,
  point: THREE.Vector3,
  radius: number,
): RoadEdge[] {
  return graph.edges.filter((edge) => {
    const mid = positionOnEdge(graph, edge, 0.5)
    return mid.distanceTo(point) < radius
  })
}

export function sampleSidewalkLoops(): THREE.Vector3[][] {
  return sidewalkLoops.length > 0 ? sidewalkLoops : []
}
