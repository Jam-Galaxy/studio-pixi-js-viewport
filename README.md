> **Status: archived.** A PixiJS viewport built for the Jam Galaxy browser studio. Developed in November 2025. Jam Galaxy is no longer active and this code is not maintained. It is published as-is so the work is readable and reusable.

# Studio Pixi.js viewport standalone
This is a viewport on pixi.js for the [studio](https://github.com/Jam-Galaxy/studio) project.

The plan was to abandon the Vue/Vuex-based viewport and move to a viewport rendered on a single canvas using pixi.js. This project includes the following main components:
- Engine2D - viewport (camera), space transitions (transforms), pixi.js scene with grids, overlays, tracks and segments.
- ViewModel - model (source of truth) for display. Contains information about tracks and segments.
- WorkerOrchestrator - contains WorkerOrchestrator + task queue + worker pool + worker script. This is needed for rendering segment textures in a separate thread.

This project focuses on track display. Only the visible portion of the tracks is displayed (camera culling).

# Install
```
npm install
```

# Run development
```
npm run dev
```
