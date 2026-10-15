/**
 * Node smoke checks (no WebGL). Run: node scripts/acceptance-smoke.mjs
 */
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const requiredScripts = ['dev', 'build']
for (const s of requiredScripts) {
  if (!pkg.scripts[s]) throw new Error(`missing npm script: ${s}`)
}

const missionDef = readFileSync('src/game/missions/missionDefinitions.ts', 'utf8')
const missionCount = (missionDef.match(/id: '/g) ?? []).length
if (missionCount < 4) throw new Error(`expected 4 missions, found ${missionCount}`)

const settingsSrc = readFileSync('src/storage/settings.ts', 'utf8')
if (!settingsSrc.includes("locale: 'en'")) throw new Error('settings missing default locale')

const messages = readFileSync('src/i18n/messages.ts', 'utf8')
if (!messages.includes('export const MESSAGES')) throw new Error('missing i18n MESSAGES export')
if (!messages.includes("'menu.language'")) throw new Error('missing i18n menu.language key')

const engine = readFileSync('src/game/GameEngine.ts', 'utf8')
if (engine.includes('buildCity(')) throw new Error('GameEngine must not call Harbor CityBuilder directly')

const bundle = JSON.parse(readFileSync('public/map-data/nanjing-core/core.bundle.json', 'utf8'))
const NON_DRIVABLE = new Set([
  'footway',
  'path',
  'steps',
  'cycleway',
  'pedestrian',
  'corridor',
  'bridleway',
  'track',
  'proposed',
  'construction',
])
const SNAP = 8
const nodes = []
const findNode = (x, z) => {
  for (const n of nodes) {
    if (Math.hypot(n.x - x, n.z - z) < SNAP) return n.id
  }
  const id = nodes.length
  nodes.push({ id, x, z })
  return id
}
const edges = []
for (const road of bundle.roads) {
  if (NON_DRIVABLE.has(road.highway)) continue
  for (let i = 0; i < road.points.length - 1; i++) {
    const a = road.points[i]
    const b = road.points[i + 1]
    const from = findNode(a.x, a.z)
    const to = findNode(b.x, b.z)
    if (from !== to) edges.push([from, to])
  }
}
const parent = [...Array(nodes.length).keys()]
const findp = (i) => {
  while (parent[i] !== i) i = parent[i] = parent[parent[i]]
  return i
}
for (const [a, b] of edges) {
  const pa = findp(a)
  const pb = findp(b)
  if (pa !== pb) parent[pb] = pa
}
const sizes = new Map()
for (let i = 0; i < nodes.length; i++) {
  const p = findp(i)
  sizes.set(p, (sizes.get(p) ?? 0) + 1)
}
const largest = Math.max(...sizes.values())
const ratio = largest / nodes.length
if (ratio < 0.9) {
  throw new Error(`drivable road graph too fragmented: largest component ${(ratio * 100).toFixed(1)}%`)
}

console.log(
  `acceptance-smoke: ok (missions + i18n + drivable graph ${(ratio * 100).toFixed(1)}% connected)`,
)
