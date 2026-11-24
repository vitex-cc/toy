# Learn App

A small Vue 3 learning app for children to practice basic arithmetic within 20 and learn the English alphabet. The app includes playful visuals, mascot feedback, keypad input, and embedded static audio so it can run without runtime audio API calls.

## Features

- Addition and subtraction practice within 20
- Visual counting with animal images
- Formula view for arithmetic layout
- Mascot feedback and sound effects
- Alphabet — learn mode: tap any letter (or press its key) to hear its name, or play A→Z in order
- Alphabet — challenge mode: listen to a letter and pick it from four options (distractors include sound-alike letters such as B/D/P/T)
- Static base64 audio bundled in the app

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Audio generation

All audio is pre-generated into `src/generated/` and committed, so normal development needs no network access.

- `npm run gen:tts` — Chinese mascot phrases (Volcengine TTS). Only phrases missing from `tts-audio.js` are synthesized. Needs `VOLC_TTS_APP_ID` and `VOLC_TTS_ACCESS_KEY` in the environment.
- `npm run gen:letters` — English letter names, built from human recordings on Wikimedia Commons (needs `ffmpeg`). Raw files are cached in `.cache/letter-audio/`.

## Notes

- `src/generated/tts-audio.js` and `src/generated/letter-audio.js` contain generated static audio data as base64 data URLs.
- Letter recordings come from Wikimedia Commons (`En-us-<letter>.ogg`, by Twocs, Dvortygirl, Logictheo, Neskaya, Geoff Sebastian and Xnux). Most are CC BY-SA 3.0 and a few are public domain; the per-letter credits are listed at the top of `letter-audio.js`. The trimmed and normalized clips are shared under the same license.
- `node_modules/` and `dist/` are ignored and should not be committed.
- If publishing publicly, confirm that all image and audio assets are allowed to be distributed.

## License

MIT
