# Ashline

**Ashline** is an original browser open-world action prototype set in **Harbor Row** — a coastal city district. Walk, drive, and explore a growing procedural city with physics collisions.

## Architecture (brief)

| Layer | Role |
| --- | --- |
| `src/components/` | React HUD, main menu, pause menu |
| `src/game/GameEngine.ts` | Three.js render loop + Rapier step |
| `src/game/world/` | District map, roads, buildings, instanced props, atmosphere |
| `src/game/entities/` | Player character controller & vehicle |
| `src/game/physics/` | Rapier world wrapper |
| `src/game/ai/` | Phase 3 traffic / pedestrian stubs |
| `src/game/systems/` | Phase 3 wanted-level hook |
| `src/game/store/` | Zustand HUD / flow state |
| `src/storage/` | `localStorage` settings |

React owns 2D UI; the canvas engine owns 3D and physics.

## Quick start

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:4317**.

```bash
npm run build
npm run preview
```

## Controls

| Input | Action |
| --- | --- |
| **WASD** | Move (relative to camera) |
| **Shift** | Run |
| **Space** | Jump (on foot) / brake (in car) |
| **Mouse** | Look (pointer lock) |
| **E** | Enter / exit the red coupe |
| **W/S** or **↑/↓** | Accelerate / reverse (driving) |
| **A/D** or **←/→** | Steer (driving) |
| **Esc** | Pause |
| **Click** | Capture mouse when hint is shown |

## Phase 1 (complete)

- Third-person movement, one drivable vehicle, HUD, menus, Rapier collisions.
- Core loop: walk → enter car → drive → exit.

## Phase 2 (complete)

- **Larger Harbor Row**: 7×6 block grid (~400 m), north–south boulevard + east–west artery, side streets.
- **Zones**: downtown towers, residential rowhouses, industrial warehouses, waterfront piers & water, pocket parks.
- **Street layer**: center dashes, crosswalks, traffic lights at intersections, sidewalks/curbs, benches, instanced street lights & trees (no per-pole point lights — better FPS).
- **Visual depth**: gradient sky dome, tuned fog, distant skyline ring, sun shadows that follow the player.
- **Performance**: shared materials, `InstancedMesh` props, emissive lamps instead of hundreds of lights.
- **Hooks**: `DayNightCycle` (off by default), traffic/pedestrian/wanted stubs wired in the engine tick.

## Phase 3 (this build)

- **Traffic AI**: up to 18 vehicles follow the intersection road graph, yield at junctions, despawn beyond ~130 m.
- **Pedestrians**: sidewalk loops, walk/idle, greet + **E** to chat; capped spawn with distance culling.
- **Missions** (data-driven, HUD + 3D markers + minimap blips):
  1. *First Steps* — move, look, talk to an NPC
  2. *Courier Run* — drive to Glass Spire Plaza
  3. *Rush Delivery* — timed run to South Pier
  4. *Harbor Row Tour* — discover four landmarks
- **Economy**: mission payouts update Credits on the HUD.
- **Save**: `localStorage` — **Continue** / **Save Game** (pause menu); stores money, health, mission progress.
- **Wanted (light)**: heat rises if you ram traffic at speed; 0–5 stars on HUD (police chase deferred).

## Next (Phase 4+)

- Police pursuit AI tied to wanted tier
- Mission board UI, more contracts, failure/retry polish
- Day/night gameplay, quality presets, IndexedDB if saves grow

## Stack

React 19, TypeScript, Vite 8, Three.js, Rapier (`@dimforge/rapier3d-compat`), Zustand.
