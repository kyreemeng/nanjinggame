/**
 * Fetch OSM map slices via api.openstreetmap.org (ODbL) and build game map bundle.
 * Usage: node scripts/build-nanjing-map-data.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.join('public', 'map-data', 'nanjing-core')
const BBOX = { minLat: 32.008, maxLat: 32.088, minLon: 118.748, maxLon: 118.852 }
const ORIGIN = { lat: 32.048, lon: 118.8, elevation: 15 }
const TILE = 0.032
const USER_AGENT = 'AshlineNanjingMapBuild/1.0 (educational)'

const DEG_TO_M_LAT = 111_320
const DEG_TO_M_LON = DEG_TO_M_LAT * Math.cos((ORIGIN.lat * Math.PI) / 180)

function geoToWorld(lat, lon) {
  return {
    x: (lon - ORIGIN.lon) * DEG_TO_M_LON,
    z: (lat - ORIGIN.lat) * DEG_TO_M_LAT,
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function parseOsmMapXml(xml) {
  const nodes = new Map()
  for (const m of xml.matchAll(/<node id="(\d+)"[^>]*lat="([^"]+)" lon="([^"]+)"/g)) {
    nodes.set(m[1], { lat: parseFloat(m[2]), lon: parseFloat(m[3]) })
  }
  const ways = []
  for (const block of xml.matchAll(/<way id="(\d+)"[\s\S]*?<\/way>/g)) {
    const wayXml = block[0]
    const id = parseInt(block[1], 10)
    const nds = [...wayXml.matchAll(/<nd ref="(\d+)"/g)].map((x) => x[1])
    const tags = {}
    for (const t of wayXml.matchAll(/<tag k="([^"]+)" v="([^"]*)"/g)) {
      tags[t[1]] = t[2]
    }
    ways.push({ id, nds, tags })
  }
  return { nodes, ways }
}

const HIGHWAY_WIDTH = {
  motorway: 14,
  trunk: 12,
  primary: 10,
  secondary: 9,
  tertiary: 8,
  unclassified: 7,
  residential: 7,
  living_street: 6,
  service: 5,
}

async function fetchTile(minLon, minLat, maxLon, maxLat) {
  const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${minLon},${minLat},${maxLon},${maxLat}`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  const text = await res.text()
  if (!res.ok || text.includes('too many nodes')) {
    throw new Error(`tile fetch failed ${minLon},${minLat}: ${text.slice(0, 200)}`)
  }
  return text
}

async function fetchDemGrid() {
  const rows = 9
  const cols = 11
  const stepLat = (BBOX.maxLat - BBOX.minLat) / (rows - 1)
  const stepLon = (BBOX.maxLon - BBOX.minLon) / (cols - 1)
  const locations = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      locations.push({
        latitude: BBOX.minLat + r * stepLat,
        longitude: BBOX.minLon + c * stepLon,
      })
    }
  }
  const res = await fetch('https://api.open-elevation.com/api/v1/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations }),
  })
  const json = await res.json()
  const elevations = json.results.map((p) => p.elevation ?? 12)
  return {
    rows,
    cols,
    originLat: BBOX.minLat,
    originLon: BBOX.minLon,
    stepLat,
    stepLon,
    elevations,
    source: 'open-elevation.com (aggregated SRTM/ASTER where available)',
    license: 'See open-elevation.com — not for production SLA',
  }
}

function polyAreaM2(points) {
  if (points.length < 3) return 0
  let a = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    a += points[i].x * points[j].z - points[j].x * points[i].z
  }
  return Math.abs(a) / 2
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const mergedNodes = new Map()
  const mergedWays = []
  const tileRefs = []

  const lonSteps = Math.ceil((BBOX.maxLon - BBOX.minLon) / TILE)
  const latSteps = Math.ceil((BBOX.maxLat - BBOX.minLat) / TILE)

  for (let i = 0; i < lonSteps; i++) {
    for (let j = 0; j < latSteps; j++) {
      const minLon = BBOX.minLon + i * TILE
      const maxLon = Math.min(BBOX.maxLon, minLon + TILE)
      const minLat = BBOX.minLat + j * TILE
      const maxLat = Math.min(BBOX.maxLat, minLat + TILE)
      const id = `t${i}_${j}`
      console.log(`fetch ${id}`)
      const xml = await fetchTile(minLon, minLat, maxLon, maxLat)
      await sleep(1100)
      const parsed = parseOsmMapXml(xml)
      for (const [k, v] of parsed.nodes) mergedNodes.set(k, v)
      mergedWays.push(...parsed.ways)
      tileRefs.push({ id, minLon, minLat, maxLon, maxLat })
    }
  }

  const roads = []
  const buildings = []
  const water = []
  const seen = new Set()

  for (const way of mergedWays) {
    if (seen.has(way.id)) continue
    seen.add(way.id)
    const hw = way.tags.highway
    if (hw && HIGHWAY_WIDTH[hw]) {
      const pts = []
      for (const nd of way.nds) {
        const n = mergedNodes.get(nd)
        if (!n) continue
        pts.push(geoToWorld(n.lat, n.lon))
      }
      if (pts.length < 2) continue
      roads.push({
        id: `r${way.id}`,
        highway: hw,
        name: way.tags.name,
        points: pts,
        width: HIGHWAY_WIDTH[hw],
        oneway: way.tags.oneway === 'yes',
        osmWayId: way.id,
      })
      continue
    }
    if (way.tags.building && way.nds.length >= 3) {
      const pts = []
      for (const nd of way.nds) {
        const n = mergedNodes.get(nd)
        if (!n) continue
        pts.push(geoToWorld(n.lat, n.lon))
      }
      if (pts.length < 3) continue
      if (polyAreaM2(pts) < 80) continue
      const levels = parseInt(way.tags['building:levels'] || '', 10)
      let h = parseFloat(way.tags.height || '')
      if (!Number.isFinite(h)) h = Number.isFinite(levels) ? levels * 3.2 : 12
      const heightSource = way.tags.height || way.tags['building:levels'] ? 'osm' : 'estimated'
      buildings.push({
        id: `b${way.id}`,
        points: pts,
        height: Math.min(120, Math.max(6, h)),
        heightSource,
        osmWayId: way.id,
      })
      continue
    }
    if ((way.tags.natural === 'water' || way.tags.waterway) && way.nds.length >= 3) {
      const pts = []
      for (const nd of way.nds) {
        const n = mergedNodes.get(nd)
        if (!n) continue
        pts.push(geoToWorld(n.lat, n.lon))
      }
      if (pts.length >= 3) {
        water.push({
          id: `w${way.id}`,
          points: pts,
          kind: way.tags.waterway ? 'riverbank' : 'water',
          osmWayId: way.id,
        })
      }
    }
  }

  console.log(`roads=${roads.length} buildings=${buildings.length} water=${water.length}`)
  const dem = await fetchDemGrid()

  const manifest = {
    version: 1,
    name: 'nanjing-core',
    crs: 'WGS84→local ENU (meters), origin documented in origin field',
    origin: ORIGIN,
    bbox: BBOX,
    sources: {
      osm: 'OpenStreetMap contributors (ODbL 1.0) via api.openstreetmap.org/0.6/map',
      elevation: dem.source,
      fetchedAt: new Date().toISOString(),
    },
    tiles: tileRefs.map((t) => ({
      ...t,
      roadsUrl: '/map-data/nanjing-core/core.bundle.json',
    })),
    dem,
    simplification: {
      maxRoadWays: roads.length,
      minBuildingAreaM2: 80,
      notes: 'Building default 12m when OSM height/levels missing',
    },
  }

  const bundle = { manifest, roads, buildings, water }
  await writeFile(path.join(OUT, 'core.bundle.json'), JSON.stringify(bundle))
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
