# Knight & Castle — PixiJS × Three.js Demo

This repository is a **demo project showcasing how to combine Three.js (3D) and PixiJS (2D) in a single WebGL context**. It renders a simple animated **night scene with a castle in the background and a patrolling knight in the foreground**, with a PixiJS HUD layered on top.

This is intentionally **not a game engine**, not production-ready, and not optimized for scale. It is a **learning and experimentation repo**.

---

## What this demo shows

- **Three.js**
  - 3D scene rendering (terrain, castle, moon, stars)
  - Basic lighting (ambient + directional + point lights)
  - Simple geometry “kitbashing” (castle, knight, horse)
  - Animation loop and scene updates
  - FPS-style camera movement using `PointerLockControls`

- **PixiJS (v8)**
  - 2D HUD rendered on top of the 3D scene
  - Shared WebGL context with Three.js
  - No canvas stacking or iframe hacks

- **Integration**
  - Shared WebGL context between Three.js and PixiJS
  - Correct render order (Three → Pixi)
  - Import maps to run without a bundler
  - Works directly in the browser via ES modules

---

## Controls

Click the canvas to activate pointer lock.

| Control | Action |
|------|------|
| Mouse | Look around |
| W / A / S / D | Move forward / left / back / right |
| Space | Move up |
| Shift | Move down |
| ESC | Release pointer lock |

---

### Python (recommended)
```bash
python -m http.server
```

Then open: http://localhost:8000
