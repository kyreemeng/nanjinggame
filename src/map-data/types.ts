export interface MapDataManifest {
  version: 1
  name: string
  crs: string
  origin: { lat: number; lon: number; elevation: number }
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number }
  sources: {
    osm: string
    elevation: string
    fetchedAt: string
  }
  tiles: MapTileRef[]
  dem: DemGridMeta
  simplification: {
    maxRoadWays: number
    minBuildingAreaM2: number
    notes: string
  }
}

export interface MapTileRef {
  id: string
  /** inclusive WGS84 bounds */
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
  roadsUrl: string
  buildingsUrl?: string
  waterUrl?: string
}

export interface DemGridMeta {
  rows: number
  cols: number
  /** WGS84 of grid corner (minLat, minLon) */
  originLat: number
  originLon: number
  stepLat: number
  stepLon: number
  /** row-major elevations in meters */
  elevations: number[]
  source: string
  license: string
}

export interface RoadPolyline {
  id: string
  highway: string
  name?: string
  /** world XZ points, y from terrain at build time */
  points: { x: number; z: number }[]
  width: number
  oneway?: boolean
  osmWayId?: number
}

export interface BuildingFootprint {
  id: string
  points: { x: number; z: number }[]
  height: number
  heightSource: 'osm' | 'estimated'
  osmWayId?: number
}

export interface WaterPolygon {
  id: string
  points: { x: number; z: number }[]
  kind: 'water' | 'riverbank'
  osmWayId?: number
}

export interface NanjingMapBundle {
  manifest: MapDataManifest
  roads: RoadPolyline[]
  buildings: BuildingFootprint[]
  water: WaterPolygon[]
}
