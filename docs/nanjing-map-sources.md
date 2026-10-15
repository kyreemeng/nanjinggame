# Nanjing map data provenance

## Acceptance

- **Authenticity over area**: loaded geometry is only what OSM/DEM fetch inside **ACTIVE_WORLD_BBOX**; no hand-painted filler terrain to “pad” the map.
- **No evidence → approximate**: proxy LOD meshes, estimated building heights, and coarse colliders must be labeled here or in code.

## Active world bbox (WGS84) — phase 3

Union of urban core + Purple Mountain scenic corridor (`ACTIVE_WORLD_BBOX` in `coordinate-system.ts`):

| Field | Value |
| --- | --- |
| minLat / maxLat | **32.018 / 32.078** |
| minLon / maxLon | **118.768 / 118.858** |
| Approx. size | ~6.7 km (E–W) × ~6.7 km (N–S) in ENU |
| Urban subset | `NANJING_VERIFIED_CORE_BBOX` (32.018–32.058, 118.768–118.818) |
| Zijin subset | `ZIJIN_VERIFIED_BBOX` (32.038–32.078, 118.808–118.858) |

**Intent:** Drive/walk from **新街口 / 玄武湖 / 中山门** into **紫金山** scenic roads toward **明孝陵** and **中山陵**, with spatial relations preserved (lake north of old city, mausoleums on the mountain slope east of the wall).

## Data sources

| Layer | Source | Artifact / code |
| --- | --- | --- |
| Roads, buildings, water | OpenStreetMap ODbL via `api.openstreetmap.org/0.6/map` | `public/map-data/nanjing-core/core.bundle.json` |
| Build script | `scripts/build-nanjing-map-data.mjs` | Tiles + DEM grid scaled to bbox |
| Elevation | open-elevation.com (13×19 grid over bbox) | `manifest.json` → `dem` |
| CRS | Local ENU tangent plane | `CRS_ORIGIN` in `coordinate-system.ts` |
| Named landmarks | OSM / gazetteer WGS84 | `src/map-data/landmarks.ts` |
| Scenic LOD | **APPROXIMATE** proxies | `src/game/world/nanjing/landmarkLod.ts` |
| Player spawn | Nearest drivable OSM road near Xinjiekou | `src/map-data/roadSpawn.ts` |

Rebuild (network required):

```bash
node scripts/build-nanjing-map-data.mjs
```

## HUD / map anchors (bilingual `中文 · English`)

| ID | Label |
| --- | --- |
| xinjiekou | 新街口 · Xinjiekou |
| xuanwu-lake | 玄武湖岸 · Xuanwu Lake shore (OSM water centroid when available) |
| ming-wall-zhongshan | 明城墙（中山门） · Ming wall (Zhongshan Gate) |
| fuzimiao | 夫子庙 · Fuzimiao |
| qinhuai-river | 秦淮河（夫子庙段） · Qinhuai River |
| zijinshan | 紫金山 · Purple Mountain |
| zhongshan-ling | 中山陵 · Sun Yat-sen Mausoleum |
| ming-xiaoling | 明孝陵 · Ming Xiaoling Mausoleum |

## Approximate / simplified (checklist)

| Item | Status |
| --- | --- |
| 中山陵 / 明孝陵 / 紫金山 massing | **APPROXIMATE** LOD boxes/cone (`landmarkLod.ts`), not surveyed models |
| Zijinshan forest cone | **APPROXIMATE** visual hint only |
| Building meshes | OSM footprints; estimated height when tags missing |
| Building colliders | Tall (≥18 m) only; coarse boxes |
| Building render cap | 1600 tallest footprints |
| Roads | Flat ribbons on DEM |
| Ming wall | Point anchor + OSM water adjacency; no full wall mesh |
| DEM | Low-resolution grid |
| Harbor Row | Off by default; `?world=harbor` only |

## Legacy Harbor Row

`CityBuilder.ts` is **not** the default world. Use `?world=harbor` for regression only.

## Local dev

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4317` (default **Nanjing** — do not add `?world=harbor`). **Start Game** loads `core.bundle.json` and `NanjingWorldBuilder`.

### Suggested screenshot camera poses (world XZ / yaw — tune in-game)

| Scene | Suggested position (x, z) | Notes |
| --- | --- | --- |
| 中山陵 LOD | (~2100, 2200) look toward `zhongshan-ling` anchor | East on 陵园路; pitch slightly down |
| 紫金山 | (~2300, 2600) wide shot toward `zijinshan` hill proxy | Shows forest cone + skyline |
| 玄武湖 | (~1200, -400) toward `xuanwu-lake` anchor | North shore water OSM |
| 夫子庙 / 秦淮 | (~-800, -2900) toward `fuzimiao` | South old town |
| Driving | Road near spawn (~-1653, -715) in vehicle | 洪武路 near Xinjiekou |

Coordinates are ENU meters from `CRS_ORIGIN` (32.048°N, 118.8°E); use the in-game map (M) to refine.
