# SPLAT WALL — TikTok LIVE Edition

A lightweight browser-based 3D paint-wall game for a laptop + OBS Browser Source. A stylized street artist throws paint and creates readable graffiti lettering with procedural splatter. The wall stays intact.

## Run locally on Windows
1. Install Node.js 18 LTS or newer.
2. Open PowerShell in the project folder.
3. Run `git pull` to get the latest version.
4. Run `npm install` (first run only), then `npm start`.
5. Open http://localhost:3000 in Chrome or Edge.
6. In OBS, add a Browser Source with URL `http://localhost:3000` and set 1920 × 1080.

## Current gameplay
- Viewer names enter a FIFO queue; only one throw animation runs at a time.
- Each turn has a walk-in, anticipation, arm swing, projectile arc, wall impact, and recovery.
- Each name gets its own wall slot; the wall resets automatically after eight tags.
- Local test buttons simulate likes, follows, and gifts.
- Type a name and press Enter / THROW IT to test.
- CLEAR WALL empties the artwork and starts a new round.

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

## Open asset sources researched
- [Kenney CC0 assets on GitHub](https://github.com/shorepine/kenney) — large model collection; this mirror is primarily static glTF-Binary models and is not the source of the current animated character.
- [Kenney Animated Characters](https://kenney.nl/assets?series=Animated+Characters) — rigged low-poly character packs, CC0.
- [Quaternius Universal Animation Library](https://quaternius.itch.io/universal-animation-library) — 120+ humanoid clips, CC0; requires a compatible rig/retargeting.
- [Quaternius Ultimate Animated Character Pack](https://quaternius.com/packs/ultimatedanimatedcharacter) — 50+ animated characters, CC0.

The current character uses lightweight procedural joint animation so it works immediately without large model downloads. The researched external packs are candidates for the next character-art upgrade; they have not been bundled into this repository yet.

## Performance
Custom low-poly geometry, capped renderer pixel ratio (1.5), procedural canvas wall texture, and no physics engine. Three.js and Google Fonts load from CDNs, so first run needs internet access.

## Project structure
- `public/index.html` — game interface and queue display
- `public/style.css` — responsive studio UI
- `public/game.js` — Three.js scene, procedural character animation, sequential queue, projectile and graffiti
- `server.js` — Express + Socket.IO event bridge
- `package.json` — dependencies and run scripts

## Prototype scope
Playable local prototype with simulated LIVE interactions. Real TikTok event ingestion, moderation/rate limits, username voice announcements and production deployment are follow-up integrations.
