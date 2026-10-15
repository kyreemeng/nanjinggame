import * as THREE from 'three'
import { BLOCK_SIZE, GRID_COLS, GRID_ROWS, ROAD_WIDTH } from '../constants'
import { gridOffsetX, gridOffsetZ } from './RoadNetwork'

const STEP = BLOCK_SIZE + ROAD_WIDTH

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
}

export interface RoadGraph {
  nodes: RoadNode[]
  edges: RoadEdge[]
}

let cached: RoadGraph | null = null

export function getRoadGraph(): RoadGraph {
  if (cached) return cached
  const nodes: RoadNode[] = []
  let id = 0
  for (let gz = 0; gz < GRID_ROWS; gz++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      nodes.push({
        id: id++,
        gx,
        gz,
        x: gx * STEP - gridOffsetX(),
        z: gz * STEP - gridOffsetZ(),
      })
    }
  }

  const nodeAt = (gx: number, gz: number) => nodes.find((n) => n.gx === gx && n.gz === gz)!

  const edges: RoadEdge[] = []
  let eid = 0
  for (const node of nodes) {
    if (node.gx < GRID_COLS - 1) {
      const next = nodeAt(node.gx + 1, node.gz)
      edges.push({ id: eid++, from: node.id, to: next.id, axis: 'x', length: STEP })
      edges.push({ id: eid++, from: next.id, to: node.id, axis: 'x', length: STEP })
    }
    if (node.gz < GRID_ROWS - 1) {
      const next = nodeAt(node.gx, node.gz + 1)
      edges.push({ id: eid++, from: node.id, to: next.id, axis: 'z', length: STEP })
      edges.push({ id: eid++, from: next.id, to: node.id, axis: 'z', length: STEP })
    }
  }

  cached = { nodes, edges }
  return cached
}

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
  const loops: THREE.Vector3[][] = []
  const pad = ROAD_WIDTH / 2 + 2.5
  const padSize = BLOCK_SIZE - pad * 2
  const half = padSize / 2

  for (let gz = 0; gz < GRID_ROWS; gz++) {
    for (let gx = 0; gx < GRID_COLS; gx++) {
      const cx = gx * STEP - gridOffsetX() + BLOCK_SIZE / 2
      const cz = gz * STEP - gridOffsetZ() + BLOCK_SIZE / 2
      const y = 0.05
      loops.push([
        new THREE.Vector3(cx - half, y, cz - half),
        new THREE.Vector3(cx + half, y, cz - half),
        new THREE.Vector3(cx + half, y, cz + half),
        new THREE.Vector3(cx - half, y, cz + half),
      ])
    }
  }
  return loops
}
