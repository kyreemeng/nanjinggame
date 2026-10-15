# 南京真实地理 · 开放世界网页游戏（Ashline）

本仓库承载基于**南京真实地理**的浏览器 3D 开放世界原型（React + Vite + Three.js + Rapier）。默认可玩区域为 **OSM 验证核心区**（新街口—中山路—玄武湖南缘—夫子庙北缘），见 `src/map-data/coordinate-system.ts` 与 `docs/nanjing-map-sources.md`。

## 验收原则

- **真实性优先于面积**：地理与场景还原以可验证依据为准，不为了“地图更大”而牺牲准确度。
- **无依据标近似重建**：缺乏可靠资料的地物、街区或细节，须在呈现或文档中明确标注为**近似重建**，不得冒充实地测绘或官方数据。

## How to run

```bash
npm install
npm run dev          # http://127.0.0.1:4317
npm run build        # production bundle
npm run preview      # serve dist/
npm run test:smoke   # node-only smoke (no WebGL)
```

Use a **desktop browser with WebGL** (Chrome, Firefox, Edge). If 3D fails to start, the game shows an error dialog instead of a blank screen.

Optional: rebuild OSM slice — `node scripts/build-nanjing-map-data.mjs`

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

Rebind keys in **Settings**.

## Architecture (brief)

| Layer | Role |
| --- | --- |
| `src/components/` | React HUD, menus, map overlay |
| `src/game/GameEngine.ts` | Three.js + Rapier loop |
| `src/game/world/nanjing/` | Nanjing world builder + OSM road graph |
| `src/map-data/` | WGS84→ENU, landmarks, DEM, bundle loader |
| `src/game/ai/` | Traffic, pedestrians, police |
| `src/game/missions/` | Mission manager + definitions |
| `src/storage/` | Save + settings |

**Legacy:** `CityBuilder.ts` (Harbor Row procedural city) remains for reference; default world uses `NanjingWorldBuilder`.

## Stack

React 19, TypeScript, Vite 8, Three.js, Rapier (`@dimforge/rapier3d-compat`), Zustand.
