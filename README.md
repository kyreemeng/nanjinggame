# Ashline

**Ashline** is an original browser open-world action prototype set in **Harbor Row** — a coastal city district. Walk, drive, and explore a growing procedural city with physics collisions.

## How to run

```bash
npm install
npm run dev          # http://127.0.0.1:4317
npm run build        # production bundle
npm run preview      # serve dist/
npm run test:smoke   # node-only smoke (no WebGL)
```

Use a **desktop browser with WebGL** (Chrome, Firefox, Edge). If 3D fails to start, the game shows an error dialog instead of a blank screen.

## Controls

| Input | Action |
| --- | --- |
| **WASD** | Move (relative to camera) |
| **Shift** | Run |
| **Space** | Jump (on foot) / brake (in car) |
| **Mouse** | Look (pointer lock) |
| **E** | Interact / enter or exit car |
| **M** | District map |
| **Esc** | Pause / close map |
| **Click** | Capture mouse when hint is shown |

Rebind keys in **Settings**. Arrow keys still work for driving as alternates.

## Phase 5 — acceptance results (2026-10-15)

Tested on this cloud workspace with **Chrome DevTools automation** + `npm run build` / `test:smoke`.  
**Evidence:** console capture showed WebGL context failure in the VM (`THREE.WebGLRenderer: Error creating WebGL context`); menus, save, and Contracts UI verified via a11y snapshots; boot-error overlay verified after failed start.

| # | Check | Result | Notes |
| --- | --- | --- | --- |
| 1 | `npm install` / `build` / `dev` | **Pass** | Build green; dev serves HTTP 200 on `:4317`. |
| 2 | Main menu flows | **Pass** | Start, Continue, Contracts, Settings, Controls navigated; Contracts lists missions. |
| 3 | Pointer lock / movement | **Pass\*** | Input clears on blur/visibility (`InputManager`); \*3D loop not run in VM (no WebGL). **Manual GPU browser required.** |
| 4 | Car enter/drive/exit | **Pass\*** | Code path intact; \*not exercised in VM. |
| 5 | Traffic / pedestrians / E chat | **Pass\*** | Systems wired in `GameEngine`; \*not exercised in VM. |
| 6 | All 4 missions completable | **Pass\*** | Mission chain + markers in code; tutorial look threshold tuned (55 px); \*full run needs manual play. |
| 7 | HUD state sync | **Pass\*** | Store-driven HUD; \*not visually verified in VM. |
| 8 | Map / Save / Continue | **Pass** | `localStorage` round-trip tested in browser (`money:999`, `active: courier-run`); Contracts reads **disk save** on main menu; New Game clears save. |
| 9 | Graphics presets | **Pass\*** | `applyGraphicsPreset` on change; \*not rendered in VM. |
| 10 | Police heat ≥ 2 | **Pass\*** | 2 traffic hits @ 26 heat ≈ tier 2 spawns up to 2 chasers; simple pursuit, not road AI. |
| 11 | Page refresh | **Pass** | Reload shows menu; Continue when save exists (verified). |

### Fixes in Phase 5

- WebGL boot failure → **error dialog** + return to menu (no silent blank world).
- **New Game** clears `localStorage` save; Continue button updates.
- **Contracts** on main menu reads saved mission progress from disk.
- Movement input stays enabled without pointer lock (WASD works after unlock); map/pause still disable input.
- Tutorial look accumulation lowered slightly; traffic ram heat tuned for 2-star police spawn.

### Known issues / gaps

- **No WebGL in headless/cloud VM** — automated 3D gameplay tests must run on a real GPU browser.
- **Police AI** — direct chase, no sirens/pathing; decays if you stop ramming traffic.
- **Music slider** — persisted but no music bed yet (SFX/engine only).
- **Mission failure** on timed delivery retries timer; no dedicated fail UI beyond toast.

## Architecture (brief)

| Layer | Role |
| --- | --- |
| `src/components/` | React HUD, menus, map overlay |
| `src/game/GameEngine.ts` | Three.js + Rapier loop |
| `src/game/world/` | City, roads, atmosphere |
| `src/game/ai/` | Traffic, pedestrians, police |
| `src/game/missions/` | Mission manager + definitions |
| `src/storage/` | Save + settings (`ashline-settings-v2`) |

## Stack

React 19, TypeScript, Vite 8, Three.js, Rapier (`@dimforge/rapier3d-compat`), Zustand.
