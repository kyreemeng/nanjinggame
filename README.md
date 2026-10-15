# Ashline

**Ashline** is an original browser open-world action prototype set in **Harbor Row** — a coastal city district. Phase 1 is a playable vertical slice: walk, jump, drive one car, and explore a procedural block with physics collisions.

## Architecture (brief)

| Layer | Role |
| --- | --- |
| `src/components/` | React HUD, main menu, pause menu |
| `src/game/GameEngine.ts` | Three.js render loop + Rapier step |
| `src/game/world/` | Procedural city meshes & colliders |
| `src/game/entities/` | Player character controller & vehicle |
| `src/game/physics/` | Rapier world wrapper |
| `src/game/store/` | Zustand HUD / flow state |
| `src/storage/` | `localStorage` settings |

React owns 2D UI; the canvas engine owns 3D and physics. Future systems (traffic, missions, wanted level) can hang off `src/game/missions/types.ts` and the game store.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (default **http://127.0.0.1:4317**).

```bash
npm run build    # production bundle
npm run preview  # serve dist
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

## Phase 1 (this build)

- Procedural **Harbor Row** grid: roads, sidewalks, crosswalks, street lights, trees, varied building silhouettes (downtown core, residential, industrial edges).
- Third-person on-foot movement with Rapier character controller, gravity, and building collisions.
- One drivable vehicle with speed-sensitive steering, follow camera, enter/exit spawn offset.
- HUD: minimap, compass, FPS, health/credits/objective stubs, speed when driving.
- Main menu → **Start Game**, pause menu, input cleared on blur / pointer unlock.

## Deferred (later phases)

- NPC / traffic density
- Police / wanted system
- Full mission chain & map UI
- Multiple vehicles, day/night cycle polish, graphics presets
- IndexedDB save slots (settings already use `localStorage`)

## Stack

React 19, TypeScript, Vite 8, Three.js, Rapier (`@dimforge/rapier3d-compat`), Zustand.
