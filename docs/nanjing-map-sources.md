# Nanjing map data provenance

## Acceptance

- **Authenticity over area**: default play uses the **verified core** bbox only (`NANJING_VERIFIED_CORE_BBOX` in `src/map-data/coordinate-system.ts`). The larger `NANJING_PLAYABLE_BBOX` is a future expansion outline — not loaded in phase 2.
- **No evidence → approximate**: anything without OSM/DEM support must be labeled approximate in code or this doc.

## Verified core bbox (WGS84)

| Field | Value |
| --- | --- |
| minLat / maxLat | 32.018 / 32.058 |
| minLon / maxLon | 118.768 / 118.818 |
| Approx. size | ~4.7 km × ~4.5 km (ENU, uncompressed) |
| Intent | Continuous drive/walk loop: **Xinjiekou ↔ Zhongshan Road ↔ Xuanwu Lake shore ↔ Ming wall (Zhongshan Gate) ↔ Fuzimiao / Qinhuai** |

**Out of scope (phase 3):** Purple Mountain full scenic area (`PHASE3_LANDMARKS` in `landmarks.ts`) — not spawned as default anchors.

## Data sources

| Layer | Source | Artifact / code |
| --- | --- | --- |
| Roads, buildings, water | OpenStreetMap ODbL via `api.openstreetmap.org/0.6/map` | `public/map-data/nanjing-core/core.bundle.json` |
| Build script | `scripts/build-nanjing-map-data.mjs` | Regenerates bundle + `manifest.json` |
| Elevation | open-elevation.com grid (SRTM/ASTER aggregate) | `manifest.json` → `dem` |
| CRS | Local ENU tangent plane | `CRS_ORIGIN` in `coordinate-system.ts` |
| Named landmarks | OSM nodes / riverbank centroids | `src/map-data/landmarks.ts`, runtime snap in `landmarkAnchors.ts` |
| Player spawn | Nearest **drivable** OSM highway near Xinjiekou | `src/map-data/roadSpawn.ts` (洪武路 secondary in current bundle) |

Rebuild (network required):

```bash
node scripts/build-nanjing-map-data.mjs
```

## Drivable road graph (phase 2)

- Graph built in `osmRoadGraph.ts` from drivable highways only (`drivableRoads.ts` excludes footway/path/steps/etc.).
- Node snap **8 m** to close tile seams; largest connected component ~**97%** of nodes in the bundled graph (see `scripts/acceptance-smoke.mjs`).
- Traffic AI uses the same graph; spawn snaps to nearest motorable polyline segment.

## HUD / map anchors

Always shown (bilingual labels `中文 · English`):

- 新街口 · Xinjiekou  
- 玄武湖岸 · Xuanwu Lake shore (OSM water centroid when bundle loaded)  
- 明城墙（中山门） · Ming wall (Zhongshan Gate) — gate coords approximate; shoreline from OSM water  
- 夫子庙 · Fuzimiao  
- 秦淮河（夫子庙段） · Qinhuai River  

## Approximate / simplified (checklist)

| Item | Status |
| --- | --- |
| Building meshes | OSM footprints; **height estimated** when `height`/`levels` missing (default 12 m per manifest) |
| Building colliders | **APPROXIMATE** coarse boxes, **tall (≥18 m) only**, to avoid blocking roads |
| Building count cap | **1200** tallest footprints rendered (performance) |
| Road driving surface | **APPROXIMATE** flat ribbons on DEM, not surveyed lane geometry |
| Ming wall gate marker | **APPROXIMATE** point; no full wall mesh in phase 2 |
| Interior / facades | Not modeled |
| DEM | Low-resolution grid; not cadastral survey |
| Harbor Row (`CityBuilder`) | **Disabled by default**; dev-only `?world=harbor` legacy switch |

## Legacy Harbor Row

Procedural **Harbor Row** (`CityBuilder.ts`) is **not** a playable entry point. Use `?world=harbor` only for regression tests.
