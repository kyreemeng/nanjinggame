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

## Phase 2 (this build)

- **Larger Harbor Row**: 7×6 block grid (~400 m), north–south boulevard + east–west artery, side streets.
- **Zones**: downtown towers, residential rowhouses, industrial warehouses, waterfront piers & water, pocket parks.
- **Street layer**: center dashes, crosswalks, traffic lights at intersections, sidewalks/curbs, benches, instanced street lights & trees (no per-pole point lights — better FPS).
- **Visual depth**: gradient sky dome, tuned fog, distant skyline ring, sun shadows that follow the player.
- **Performance**: shared materials, `InstancedMesh` props, emissive lamps instead of hundreds of lights.
- **Hooks**: `DayNightCycle` (off by default), traffic/pedestrian/wanted stubs wired in the engine tick.

## Next (Phase 3+)

- Moving traffic & pedestrians using road/sidewalk graphs
- Police / wanted gameplay tied to `WantedSystem`
- Mission chain, map UI, day/night polish, quality presets
- IndexedDB save slots

## Stack

React 19, TypeScript, Vite 8, Three.js, Rapier (`@dimforge/rapier3d-compat`), Zustand.
