# Learn App

A small Vue 3 learning app for children to practice basic arithmetic within 20. The app includes playful visuals, mascot feedback, keypad input, and embedded static TTS audio so it can run without runtime audio API calls.

## Features

- Addition and subtraction practice within 20
- Visual counting with animal images
- Formula view for arithmetic layout
- Mascot feedback and sound effects
- Static base64 TTS audio bundled in the app

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

## Notes

- `src/generated/tts-audio.js` contains generated static audio data as base64 data URLs.
- `node_modules/` and `dist/` are ignored and should not be committed.
- If publishing publicly, confirm that all image and audio assets are allowed to be distributed.

## License

MIT
