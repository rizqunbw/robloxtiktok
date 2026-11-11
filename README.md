# SPLAT WALL — TikTok LIVE Edition

Portrait-first lightweight 3D paint/fruit arcade game for a laptop + OBS Browser Source.

## Run locally on Windows
1. Install Node.js 18 LTS or newer.
2. Pull the latest source: `git pull origin main`.
3. Install the local 3D assets: double-click `INSTALL-ASSETS.bat` (or run `powershell -ExecutionPolicy Bypass -File .\install-assets.ps1`).
4. Run `npm install` (first run only), then `npm start`.
5. Open http://localhost:3000.
6. In OBS, add a Browser Source with URL `http://localhost:3000` and set Width **1080**, Height **1920**.

The asset installer downloads selected GLB files into `public/assets` from the Kenney public asset mirror. Keep internet access enabled while installing.

## Current prototype gameplay
- Portrait wall composition: 2 columns × 4 rows; names no longer stack in the centre.
- Viewer names enter a FIFO queue; one viewer's turn runs at a time.
- Gift events enqueue repeated fruit throws (2–6 based on the coin value); follow events enqueue a two-throw bonus; likes add a periodic bonus.
- Fruit GLBs (apple, banana, orange, tomato, watermelon, pineapple) are loaded as actual 3D projectiles.
- Paint projectiles are lightweight 3D procedural paint capsules with droplets.
- A Kenney character GLB is loaded with any embedded animation clips; the runtime selects idle/walk/throw-like clips when available and keeps the low-poly fallback if the asset is missing.
- Each completed throw writes a separate wall slot; the wall resets after eight tags.
- Local buttons simulate LIVE events for testing.

## Asset sources and licensing
- Kenney official asset pages identify **Mini Characters** and **Food Kit** as Creative Commons CC0: https://kenney.nl/assets/mini-characters and https://kenney.nl/assets/food-kit
- Kenney's support page confirms its game assets are public-domain CC0, including commercial use: https://kenney.nl/support
- Public GLB mirror used by the installer: https://github.com/shorepine/kenney
- Optional richer animation source for a later character upgrade: Quaternius Universal Animation Library (CC0): https://quaternius.itch.io/universal-animation-library
- Quaternius Ultimate Animated Character Pack lists 52 models and CC0: https://quaternius.com/packs/ultimatedanimatedcharacter

The installer currently downloads a selected lightweight subset, not every asset in those packs. The Quaternius packs are references for the next rig/animation upgrade and are not bundled by this installer.

## TikTok LIVE bridge contract
A separate compliant TikTok LIVE connector can connect to this Socket.IO server and emit:
```js
socket.emit("live:event", {
  type: "comment", // comment | like | follow | gift
  username: "viewer_name",
  message: "GRACE",
  giftName: "Rose",
  coins: 1
});
```
The server broadcasts sanitized events as `game:event`. TikTok ingestion is not automatic yet; a provider/bridge must be connected separately. Keep credentials private.

## Performance
Low-poly GLB assets, no physics engine, capped renderer pixel ratio (1.5), and canvas-based wall typography. Three.js and Google Fonts load from CDNs, so first run needs internet access.

## Project structure
- `public/index.html` — game interface and queue display
- `public/style.css` — portrait-first UI layout
- `public/game.js` — Three.js scene, GLB loading, animation clips, sequential throws and wall art
- `install-assets.ps1` / `INSTALL-ASSETS.bat` — local 3D asset installer
- `server.js` — Express + Socket.IO event bridge
- `package.json` — dependencies and run scripts

## Prototype scope
This is an upgraded local prototype. Imported animation coverage depends on the clips embedded in the selected GLB. More expressive dedicated throw clips, voice announcements, moderation/rate limits and production TikTok ingestion are still follow-up work.
