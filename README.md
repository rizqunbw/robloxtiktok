# SPLAT WALL — TikTok LIVE Edition

A lightweight browser-based 3D paint-wall game for a laptop + OBS Browser Source. A low-poly street artist throws paint and creates readable graffiti lettering with procedural splatter. The wall stays intact.

## Run locally on Windows
1. Install Node.js 18 LTS or newer.
2. Download or clone this repository.
3. Open a terminal in the project folder.
4. Run `npm install`, then `npm start`.
5. Open http://localhost:3000 in Chrome or Edge.
6. In OBS, add a Browser Source with URL `http://localhost:3000` and set the canvas to 1920 × 1080.

## Controls
- Type a name and press Enter / THROW IT.
- Select a paint colour and graffiti lettering style.
- LIKE / FOLLOW / SEND GIFT buttons simulate LIVE events locally.
- CLEAR WALL starts a fresh round.

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
The server sanitizes and broadcasts the event as `game:event`. This project does not claim to connect to TikTok automatically; a provider/bridge must be connected separately. Keep credentials private.

## Performance
Custom low-poly character, simple geometry, capped renderer pixel ratio (1.5), procedural canvas wall texture, and no physics engine. Three.js and Google Fonts are loaded from CDNs, so the first run needs internet access.

## Project structure
- `public/index.html` — game interface
- `public/style.css` — responsive studio UI
- `public/game.js` — Three.js scene, throw animation, graffiti and event handling
- `server.js` — Express + Socket.IO event bridge
- `package.json` — dependencies and run scripts

## Prototype scope
Playable local prototype with simulated LIVE interactions. Real TikTok event ingestion, moderation/rate limits, username voice announcements and production deployment are follow-up integrations.
