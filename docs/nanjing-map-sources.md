# Nanjing map data provenance

## Acceptance

- **Authenticity over area**: the playable slice is the **verified core** bbox in `src/map-data/coordinate-system.ts`, not the full old-town vision.
- **No evidence → approximate**: building extrusion caps, simplified colliders, and missing interiors are **approximate reconstruction** and must not be presented as surveyed ground truth.

## Sources

| Layer | Source | Notes |
| --- | --- | --- |
| Roads / buildings / water | OpenStreetMap via `scripts/build-nanjing-map-data.mjs` | Stored in `public/map-data/nanjing-core/core.bundle.json` |
| Landmarks | OSM / public gazetteer WGS84 | `src/map-data/landmarks.ts` |
| Terrain height | Bundled DEM grid in manifest | Sampled in `src/map-data/terrain.ts` |
| CRS | Local ENU tangent plane | Origin documented in `coordinate-system.ts` |

Rebuild bundle (requires network + Map API token if configured):

```bash
node scripts/build-nanjing-map-data.mjs
```
