import { STATIC_TTS_AUDIO } from "../generated/tts-audio.js";
import { LETTER_AUDIO } from "../generated/letter-audio.js";

// text -> data URL
const cache = new Map();
let currentAudio = null;
let currentResolve = null;

function getUrl(text) {
  if (cache.has(text)) return cache.get(text);
  if (STATIC_TTS_AUDIO[text]) {
    cache.set(text, STATIC_TTS_AUDIO[text]);
    return STATIC_TTS_AUDIO[text];
  }
  console.warn(`[tts] missing static audio: ${text}`);
  return null;
}

function stopCurrent() {
  if (!currentAudio) return;
  const prevRes = currentResolve;
  try {
    currentAudio.pause();
  } catch {
    //
  }
  currentAudio.src = "";
  currentAudio = null;
  currentResolve = null;
  if (prevRes) prevRes();
}

// Resolves when the audio finishes playing (ended / error / interrupt /
// autoplay-blocked). Returns immediately if the clip is missing.
export async function speak(text) {
  if (!text) return;
  return playUrl(getUrl(text));
}

// Play the English name of a letter ("A" -> /eɪ/).
export async function speakLetter(letter) {
  const url = LETTER_AUDIO[String(letter).toUpperCase()];
  if (!url) console.warn(`[tts] missing letter audio: ${letter}`);
  return playUrl(url);
}

function playUrl(url) {
  if (!url) return Promise.resolve();

  stopCurrent();

  const audio = new Audio(url);
  return new Promise((resolve) => {
    currentAudio = audio;
    currentResolve = resolve;
    const done = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        currentResolve = null;
      }
      resolve();
    };
    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    audio.play().catch((e) => {
      console.warn("[tts] play blocked:", e.message);
      done();
    });
  });
}

export function stopSpeech() {
  stopCurrent();
}

// Warm up the cache for a list of phrases (fire-and-forget).
export function prewarm(texts) {
  for (const t of texts) {
    if (t && !cache.has(t)) getUrl(t);
  }
}
