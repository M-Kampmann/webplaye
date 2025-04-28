# Simple Audio Player

A simple React-based audio player that lets users upload and play multiple mp3 files, select tracks, and control playback speed. Ready for static hosting (Coolify, Netlify, Vercel, etc).

## Features
- Upload and play multiple mp3 files (browser session only)
- Select and play tracks (uploaded or pre-hosted in `public/tracks/`)
- Media controls: play/pause, seek, volume, playback speed

## Usage
1. Place static mp3s in `public/tracks/` (optional)
2. `npm install`
3. `npm start` (for local dev) or `npm run build` (for production)

## Hosting
- Deploy the `build/` folder to any static host (Coolify, Netlify, Vercel, etc)
- Upload mp3s via the UI or include them in `public/tracks/` for default tracks
