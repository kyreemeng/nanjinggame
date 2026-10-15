import * as THREE from 'three'
import type { RoadPolyline } from '../../../map-data/types'
import type { RoadEdge, RoadGraph, RoadNode } from '../roadGraphTypes'

const SNAP_M = 5.5

function dist2d(a: { x: number; z: number }, b: { x: number; z: number }): number {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

export function buildRoadGraphFromOsM(roads: RoadPolyline[]): RoadGraph {
  const nodes: RoadNode[] = []
  const findOrCreateNode = (x: number, z: number): number => {
    for (const n of nodes) {
      if (dist2d(n, { x, z }) < SNAP_M) return n.id
    }
    const id = nodes.length
    nodes.push({ id, x, z, gx: 0, gz: 0 })
    return id
  }

  const edges: RoadEdge[] = []
  let eid = 0

  for (const road of roads) {
    for (let i = 0; i < road.points.length - 1; i++) {
      const a = road.points[i]
      const b = road.points[i + 1]
      const len = dist2d(a, b)
      if (len < 2) continue
      const from = findOrCreateNode(a.x, a.z)
      const to = findOrCreateNode(b.x, b.z)
      if (from === to) continue
      const axis: 'x' | 'z' = Math.abs(b.x - a.x) >= Math.abs(b.z - a.z) ? 'x' : 'z'
      edges.push({ id: eid++, from, to, axis, length: len, width: road.width })
      if (!road.oneway) {
        edges.push({ id: eid++, from: to, to: from, axis, length: len, width: road.width })
      }
    }
  }

  return { nodes, edges }
}

export function sampleSidewalkAlongRoads(roads: RoadPolyline[]): THREE.Vector3[][] {
  const loops: THREE.Vector3[][] = []
  for (const road of roads) {
    if (road.highway === 'service') continue
    for (let i = 0; i < road.points.length - 1; i += 2) {
      const a = road.points[i]
      const b = road.points[i + 1] ?? road.points[i]
      const dx = b.x - a.x
      const dz = b.z - a.z
      const len = Math.hypot(dx, dz) || 1
      const ox = (-dz / len) * (road.width * 0.55)
      const oz = (dx / len) * (road.width * 0.55)
      loops.push([
        new THREE.Vector3(a.x + ox, 0.05, a.z + oz),
        new THREE.Vector3(b.x + ox, 0.05, b.z + oz),
        new THREE.Vector3(b.x - ox, 0.05, b.z - oz),
        new THREE.Vector3(a.x - ox, 0.05, a.z - oz),
      ])
    }
  }
  if (loops.length > 48) return loops.filter((_, i) => i % Math.ceil(loops.length / 48) === 0)
  return loops
}
