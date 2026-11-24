// Build src/generated/letter-audio.js from real human recordings of the
// English letter names (US English) on Wikimedia Commons — the same clips
// Wiktionary uses on each letter's page.
//
//   npm run gen:letters
//
// Requires ffmpeg. Raw downloads are cached in .cache/letter-audio/ and
// verified against the SHA-1 published by the Commons API. upload.wikimedia.org
// rate-limits aggressively, so when it answers 429 the identical file is
// fetched from the Wayback Machine instead. Each clip is trimmed, high-passed and loudness-matched so letters
// recorded by different speakers play at a similar volume.

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache/letter-audio");
const OUT = path.join(ROOT, "src/generated/letter-audio.js");
const UA = "LearnAppLetterAudio/1.0 (kids learning app; build script) node-fetch";

const PD = "Public domain";
const BYSA = "CC BY-SA 3.0";
// letter -> [Commons file, author, license]
const SOURCES = {
  A: ["En-us-a.ogg", "Xnux", PD],
  B: ["En-us-b.ogg", "Twocs", BYSA],
  C: ["En-us-c.ogg", "Twocs", BYSA],
  D: ["En-us-d.ogg", "Twocs", BYSA],
  E: ["En-us-e.ogg", "Logictheo", BYSA],
  F: ["En-us-f.ogg", "Twocs", BYSA],
  G: ["En-us-g.ogg", "Twocs", BYSA],
  H: ["En-us-h.ogg", "Twocs", BYSA],
  I: ["En-us-i.ogg", "Geoff Sebastian", PD],
  J: ["En-us-j.ogg", "Dvortygirl", BYSA],
  K: ["En-us-k.ogg", "Neskaya", BYSA],
  L: ["En-us-L.ogg", "Twocs", BYSA],
  M: ["En-us-m.ogg", "Twocs", BYSA],
  N: ["En-us-n.ogg", "Dvortygirl", BYSA],
  O: ["En-us-o.ogg", "Twocs", BYSA],
  P: ["En-us-p.ogg", "Dvortygirl", BYSA],
  Q: ["En-us-q.ogg", "Twocs", BYSA],
  R: ["En-us-r.ogg", "Logictheo", BYSA],
  S: ["En-us-s.ogg", "Twocs", BYSA],
  T: ["En-us-t.ogg", "Twocs", BYSA],
  U: ["En-us-u.ogg", "Twocs", BYSA],
  V: ["En-us-v.ogg", "Twocs", BYSA],
  W: ["En-us-w.ogg", "Twocs", BYSA],
  X: ["En-us-x.ogg", "Twocs", BYSA],
  Y: ["En-us-y.ogg", "Twocs", BYSA],
  Z: ["En-us-z.ogg", "Dvortygirl", BYSA],
};

const TARGET_MEAN_DB = -18; // matches the Chinese TTS clips
const MAX_PEAK_DB = -1;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sha1 = (buf) => crypto.createHash("sha1").update(buf).digest("hex");

// file name -> { url, sha1 } for the current revision on Commons.
async function fetchFileInfo(files) {
  const params = new URLSearchParams({
    action: "query",
    titles: files.map((f) => `File:${f}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|sha1",
    format: "json",
    formatversion: "2",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const info = {};
  for (const page of (await res.json()).query.pages) {
    const ii = page.imageinfo?.[0];
    if (!ii) throw new Error(`Commons: ${page.title} not found`);
    info[page.title.replace(/^File:/, "")] = { url: ii.url, sha1: ii.sha1 };
  }
  return info;
}

async function tryFetch(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) return { status: res.status };
  return { status: res.status, buf: Buffer.from(await res.arrayBuffer()) };
}

async function download(file, { url, sha1: expected }, dest) {
  const sources = [
    ["commons", url],
    ["wayback", `https://web.archive.org/web/2024id_/${url}`],
  ];
  for (let round = 1; round <= 5; round++) {
    for (const [name, src] of sources) {
      const { status, buf } = await tryFetch(src);
      if (!buf) {
        console.log(`  ${file}: ${name} HTTP ${status}`);
        continue;
      }
      if (sha1(buf) !== expected) {
        console.log(`  ${file}: ${name} copy differs from current Commons revision`);
        continue;
      }
      fs.writeFileSync(dest, buf);
      return name;
    }
    console.log(`  ${file}: retrying in ${30 * round}s`);
    await sleep(30 * round * 1000);
  }
  throw new Error(`${file}: giving up after retries`);
}

function ffmpeg(args) {
  return execFileSync("ffmpeg", ["-hide_banner", "-nostdin", "-v", "info", ...args], {
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

const FRAME = 0.01; // seconds per RMS frame
const MIN_SOUND = 0.06; // shorter bursts are clicks / breaths, not speech
const MAX_GAP = 0.15; // pauses shorter than this stay inside one sound
const LEAD = 0.03; // keep a little room before / after the voice
const TAIL = 0.08;

// Run an analysis filter chain and return ffmpeg's stderr log.
function analyze(src, filter) {
  const { status, stderr } = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostdin", "-i", src, "-af", filter, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  if (status !== 0) throw new Error(`ffmpeg failed on ${src}: ${stderr}`);
  return stderr;
}

// Per-frame RMS level (dB) of the high-passed mono signal.
function frameLevels(src) {
  const rate = 16000;
  const pcm = execFileSync(
    "ffmpeg",
    ["-hide_banner", "-nostdin", "-v", "error", "-i", src, "-af", "highpass=f=70", "-ac", "1", "-ar", String(rate), "-f", "s16le", "-"],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
  const size = Math.round(rate * FRAME);
  const levels = [];
  for (let i = 0; i + size <= samples.length; i += size) {
    let sum = 0;
    for (let j = i; j < i + size; j++) sum += (samples[j] / 32768) ** 2;
    levels.push(10 * Math.log10(sum / size + 1e-12));
  }
  return { levels, duration: samples.length / rate };
}

// Find where the spoken letter starts and ends. The threshold adapts to each
// recording's noise floor, and short bursts (clicks, lip noise) are ignored.
function speechBounds(src) {
  const { levels, duration } = frameLevels(src);
  const sorted = levels.slice().sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.1)];
  const peak = sorted[sorted.length - 1];
  const threshold = Math.max(floor + 10, peak - 32);

  const runs = [];
  levels.forEach((db, i) => {
    if (db < threshold) return;
    const last = runs[runs.length - 1];
    if (last && i - last[1] <= MAX_GAP / FRAME) last[1] = i + 1;
    else runs.push([i, i + 1]);
  });
  const speech = runs.filter(([a, b]) => (b - a) * FRAME >= MIN_SOUND);
  if (!speech.length) throw new Error(`${src}: no speech detected`);
  return {
    start: Math.max(0, speech[0][0] * FRAME - LEAD),
    end: Math.min(duration, speech[speech.length - 1][1] * FRAME + TAIL),
  };
}

function trimFilter({ start, end }) {
  const len = end - start;
  return (
    `highpass=f=70,atrim=${start.toFixed(3)}:${end.toFixed(3)},asetpts=PTS-STARTPTS,` +
    `afade=t=in:d=0.01,afade=t=out:st=${(len - 0.02).toFixed(3)}:d=0.02`
  );
}

function measure(src, bounds) {
  const log = analyze(src, `${trimFilter(bounds)},volumedetect`);
  const mean = Number(log.match(/mean_volume: (-?[\d.]+) dB/)[1]);
  const peak = Number(log.match(/max_volume: (-?[\d.]+) dB/)[1]);
  return { mean, peak };
}

function encode(src, bounds, gainDb) {
  return ffmpeg([
    "-i", src,
    "-af", `${trimFilter(bounds)},volume=${gainDb.toFixed(2)}dB,adelay=60,apad=pad_dur=0.12`,
    "-ac", "1", "-ar", "24000", "-b:a", "64k", "-f", "mp3", "-",
  ]);
}

fs.mkdirSync(CACHE, { recursive: true });
const fileInfo = await fetchFileInfo(Object.values(SOURCES).map(([file]) => file));
const entries = [];
for (const [letter, [file, author, license]] of Object.entries(SOURCES)) {
  const raw = path.join(CACHE, file);
  const info = fileInfo[file];
  if (!fs.existsSync(raw) || sha1(fs.readFileSync(raw)) !== info.sha1) {
    const via = await download(file, info, raw);
    console.log(`downloaded ${file} (${via})`);
    await sleep(2000);
  }
  const bounds = speechBounds(raw);
  const { mean, peak } = measure(raw, bounds);
  const gain = Math.min(TARGET_MEAN_DB - mean, MAX_PEAK_DB - peak);
  const mp3 = encode(raw, bounds, gain);
  console.log(
    `${letter}: ${bounds.start.toFixed(2)}-${bounds.end.toFixed(2)}s ` +
      `mean ${mean}dB peak ${peak}dB gain ${gain.toFixed(1)}dB -> ${mp3.length} bytes`,
  );
  entries.push({ letter, file, author, license, data: mp3.toString("base64") });
}

const credits = entries
  .map((e) => `//   ${e.letter}  ${e.file.padEnd(12)} ${e.author} (${e.license})`)
  .join("\n");
const body = entries
  .map((e) => `  ${e.letter}: "data:audio/mpeg;base64,${e.data}"`)
  .join(",\n");

fs.writeFileSync(
  OUT,
  `// English letter-name recordings (US English), embedded as base64 data URLs.
// Generated by scripts/gen-letter-audio.js — do not edit by hand.
//
// Source: Wikimedia Commons (https://commons.wikimedia.org/wiki/File:<file>).
// Clips were trimmed and loudness-normalized; CC BY-SA 3.0 clips are
// redistributed under the same license (https://creativecommons.org/licenses/by-sa/3.0/).
//
${credits}

export const LETTER_AUDIO = {
${body}
};
`,
);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
