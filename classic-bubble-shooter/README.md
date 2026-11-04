# Bubble Pop — React Bubble Shooter

A responsive, classic-style bubble shooter built with React, Vite, CSS, and DOM-positioned bubbles.

## Features
- Mouse, touch, and pointer aiming/shooting
- Bubble travel animation, wall bounce, and collision detection
- Hexagonal/staggered bubble neighborhood matching
- Three-or-more color matching and floating-bubble removal
- Score, level, shots, lives, next bubble, and power-pop toggle
- Pause, restart, win/loss states, responsive desktop/mobile layout
- Optional synthesized pop sound (sound is muted initially)

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm

## Run locally
1. Extract this project.
2. Open a terminal in the `classic-bubble-shooter` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build
```bash
npm run build
npm run preview
```

## Controls
- Move the pointer over the board to aim.
- Click or tap above the launcher to shoot.
- Use the speaker button to toggle sound.
- Use pause and restart in the top-right.
- Select **Power pop** before a shot to remove the connected matching cluster and its immediate neighbors.

## Notes
- The game uses DOM elements rather than Canvas, as requested.
- It uses generated CSS bubble artwork; no third-party game assets are required.
- The best-run display is a visual placeholder in this starter and can be connected to `localStorage` persistence as a next enhancement.
- For a production release, test on target mobile browsers and consider adding accessibility labels, richer level balancing, and a dedicated game-state reducer.
