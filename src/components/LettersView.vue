<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Mascot from "./Mascot.vue";
import SpeakerIcon from "./SpeakerIcon.vue";
import { Sound } from "../composables/sound.js";
import { speak, speakLetter, stopSpeech } from "../composables/tts.js";
import {
    LETTERS,
    createLetterBag,
    genLetterQuestion,
    pickLetterMsg,
} from "../composables/letters.js";

const props = defineProps({
    palette: Object,
    soundOn: Boolean,
    streak: Number,
});
const emit = defineEmits(["answer"]);

// Alphabet-song layout: 7 columns, with a gap after OPQ and UVW.
const GRID_ROWS = ["ABCDEFG", "HIJKLMN", "OPQ RST", "UVW XYZ"];
const GRID_CELLS = GRID_ROWS.join("")
    .split("")
    .map((c, i) => ({ key: c === " " ? `gap-${i}` : c, letter: c === " " ? null : c }));

const TILE_COLORS = ["#ff6f91", "#ffa94d", "#5fb85a", "#6c7dff", "#26b5d9", "#b46ad6"];
const tileColor = (letter) => TILE_COLORS[LETTERS.indexOf(letter) % TILE_COLORS.length];

const mode = ref("learn"); // "learn" | "quiz"
const speaking = ref(null); // letter currently being pronounced

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function sfx(name) {
    if (props.soundOn && Sound[name]) Sound[name]();
}

// Every user action bumps the run id; async sequences (question prompt,
// answer feedback) bail out as soon as they notice they're stale.
let runId = 0;
function interrupt() {
    runId += 1;
    speaking.value = null;
    stopSpeech();
    return runId;
}

async function sayLetter(letter, id) {
    speaking.value = letter;
    await speakLetter(letter);
    if (id === runId) speaking.value = null;
}

// ---------- learn mode ----------
const current = ref("A");
const bounceKey = ref(0);

function tapLetter(letter) {
    const id = interrupt();
    sfx("key");
    current.value = letter;
    bounceKey.value += 1;
    sayLetter(letter, id);
}

// ---------- quiz mode ----------
const nextLetter = createLetterBag();
const q = ref(genLetterQuestion(nextLetter()));
const picked = ref(null);
const status = ref(null); // null | "correct" | "wrong"
const mascotMood = ref("idle");
const mascotMsg = ref(pickLetterMsg("ask"));

async function newQuestion({ withPrompt = false } = {}) {
    const id = interrupt();
    q.value = genLetterQuestion(nextLetter());
    picked.value = null;
    status.value = null;
    mascotMood.value = "idle";
    mascotMsg.value = pickLetterMsg("ask");
    if (withPrompt) {
        await speak(mascotMsg.value);
        if (id !== runId) return;
        await delay(150);
    } else {
        sfx("next");
        await delay(250);
    }
    if (id !== runId) return;
    await sayLetter(q.value.answer, id);
}

function replay() {
    if (status.value) return;
    const id = interrupt();
    sayLetter(q.value.answer, id);
}

async function choose(letter) {
    if (status.value) return;
    const id = interrupt();
    picked.value = letter;
    const answer = q.value.answer;
    if (letter === answer) {
        status.value = "correct";
        emit("answer", true);
        const mood = (props.streak || 0) + 1 >= 3 ? "cheer" : "happy";
        mascotMood.value = mood;
        mascotMsg.value = pickLetterMsg(mood);
        sfx("correct");
        await speak(mascotMsg.value);
        if (id !== runId) return;
        await delay(300);
    } else {
        status.value = "wrong";
        emit("answer", false);
        mascotMood.value = "sad";
        const msg = pickLetterMsg("wrong");
        mascotMsg.value = `${msg} ${answer}${answer.toLowerCase()}`;
        sfx("wrong");
        await delay(350);
        if (id !== runId) return;
        await speak(msg);
        if (id !== runId) return;
        await sayLetter(answer, id);
        if (id !== runId) return;
        await delay(700);
    }
    if (id !== runId) return;
    newQuestion();
}

function optionState(letter) {
    if (!status.value) return "idle";
    if (letter === q.value.answer) return "right";
    if (letter === picked.value) return "wrong";
    return "dim";
}

// ---------- shared ----------
function setMode(m) {
    if (m === mode.value) return;
    sfx("tab");
    mode.value = m;
    if (m === "quiz") newQuestion({ withPrompt: true });
    else interrupt();
}

function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    if (mode.value === "learn") {
        if (LETTERS.includes(key)) tapLetter(key);
        else if (key === " " || key === "Enter") tapLetter(current.value);
        else return;
    } else {
        const idx = Number(key) - 1;
        if (idx >= 0 && idx < q.value.options.length) choose(q.value.options[idx]);
        else if (q.value.options.includes(key)) choose(key);
        else if (key === " " || key === "Enter") replay();
        else return;
    }
    e.preventDefault();
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => {
    window.removeEventListener("keydown", onKey);
    interrupt();
});

const rootVars = computed(() => ({
    "--primary": props.palette.primary,
    "--primary-deep": props.palette.primaryDeep,
    "--card": props.palette.card,
    "--bg-soft": props.palette.bgSoft,
    "--ink": props.palette.ink,
    "--ink-soft": props.palette.inkSoft,
}));
</script>

<template>
    <div class="letters-shell" :class="mode" :style="rootVars">
        <div class="letters-side">
            <div class="letters-modes">
                <button
                    class="letters-mode"
                    :class="{ active: mode === 'learn' }"
                    @click="setMode('learn')"
                >
                    📖 学习
                </button>
                <button
                    class="letters-mode"
                    :class="{ active: mode === 'quiz' }"
                    @click="setMode('quiz')"
                >
                    🎯 挑战
                </button>
            </div>

            <!-- learn: the tapped letter, as big as the column allows -->
            <button
                v-if="mode === 'learn'"
                class="letters-big"
                :style="{ color: tileColor(current) }"
                @click="tapLetter(current)"
            >
                <span :key="bounceKey" class="letters-big-inner">
                    <span class="letters-big-upper">{{ current }}</span>
                    <span class="letters-big-lower">{{ current.toLowerCase() }}</span>
                </span>
                <span class="letters-big-speaker">
                    <SpeakerIcon :active="speaking === current" />
                </span>
            </button>

            <!-- quiz: replay button + mascot feedback -->
            <template v-else>
                <div class="letters-focus">
                    <button
                        class="letters-speaker"
                        :class="{ speaking: speaking === q.answer && !status }"
                        :disabled="!!status"
                        @click="replay"
                    >
                        <span class="letters-speaker-icon">
                            <SpeakerIcon :active="speaking === q.answer && !status" />
                        </span>
                        <span class="letters-speaker-label">再听一次</span>
                    </button>
                </div>
                <div class="letters-mascot-panel">
                    <Mascot :mood="mascotMood" :message="mascotMsg" :palette="palette" />
                    <button
                        class="letters-action"
                        :disabled="!!status"
                        @click="newQuestion()"
                    >
                        换一题 ↻
                    </button>
                </div>
            </template>
        </div>

        <div v-if="mode === 'learn'" class="letters-grid">
            <template v-for="cell in GRID_CELLS" :key="cell.key">
                <button
                    v-if="cell.letter"
                    class="letters-tile"
                    :class="{ active: cell.letter === current, speaking: speaking === cell.letter }"
                    :style="{ '--tile': tileColor(cell.letter) }"
                    @click="tapLetter(cell.letter)"
                >
                    <span class="letters-tile-upper">{{ cell.letter }}</span>
                    <span class="letters-tile-lower">{{ cell.letter.toLowerCase() }}</span>
                </button>
                <div v-else class="letters-tile-gap" />
            </template>
        </div>

        <div v-else :key="q.id" class="letters-options">
            <button
                v-for="(l, i) in q.options"
                :key="l"
                class="letters-option"
                :class="optionState(l)"
                :style="{ '--tile': tileColor(l), animationDelay: `${i * 60}ms` }"
                :disabled="!!status"
                @click="choose(l)"
            >
                <span class="letters-option-text">
                    <span class="letters-option-upper">{{ l }}</span>
                    <span class="letters-option-lower">{{ l.toLowerCase() }}</span>
                </span>
                <span v-if="optionState(l) === 'right'" class="letters-option-mark">✓</span>
                <span v-else-if="optionState(l) === 'wrong'" class="letters-option-mark">✗</span>
            </button>
        </div>
    </div>
</template>

<style>
.letters-shell {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(280px, 1fr) 1.5fr;
    gap: 24px;
    min-height: 0;
}
.letters-shell button {
    border: none;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
}
.letters-shell button:disabled {
    cursor: default;
}
.letters-side {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    min-height: 0;
}

/* mode switch */
.letters-modes {
    display: flex;
    gap: 6px;
    padding: 6px;
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.letters-shell .letters-mode {
    flex: 1;
    padding: 10px 0;
    border-radius: 16px;
    background: transparent;
    color: var(--ink-soft);
    font-size: 18px;
    font-weight: 800;
    transition: background 0.2s, color 0.2s;
}
.letters-shell .letters-mode.active {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 6px 14px color-mix(in srgb, var(--primary) 35%, transparent);
}

/* learn: big letter card, fills the rest of the column */
.letters-shell .letters-big {
    position: relative;
    flex: 1;
    min-height: 0;
    width: 100%;
    container-type: size;
    border-radius: 28px;
    background: #fff;
    box-shadow: 0 8px 0 var(--bg-soft), 0 14px 30px rgba(255, 111, 145, 0.12);
    font-weight: 800;
    line-height: 1;
    overflow: hidden;
}
.letters-big-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    align-content: center;
    justify-content: center;
    gap: 0.12em;
    animation: pop 0.35s ease-out;
}
.letters-big-upper {
    font-size: min(64cqh, 40cqw);
}
.letters-big-lower {
    font-size: min(48cqh, 30cqw);
    opacity: 0.75;
}
/* Tall card (landscape side column): stack A over a, much bigger. */
@container (aspect-ratio < 0.85) {
    .letters-big-inner {
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        gap: 3cqh;
        padding-bottom: 4cqh;
    }
    .letters-big-upper {
        font-size: min(38cqh, 66cqw);
    }
    .letters-big-lower {
        font-size: min(30cqh, 52cqw);
    }
}
.letters-big-speaker {
    position: absolute;
    right: max(12px, 4cqmin);
    bottom: max(12px, 4cqmin);
    width: clamp(44px, 12cqmin, 68px);
    height: clamp(44px, 12cqmin, 68px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: color-mix(in srgb, currentColor 14%, #fff);
}
.letters-big-speaker .speaker-icon {
    width: 56%;
    height: 56%;
}

/* quiz: replay button */
.letters-focus {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-radius: 20px;
    background: var(--card);
    box-shadow: 0 10px 30px rgba(255, 111, 145, 0.12);
}
.letters-shell .letters-speaker {
    width: clamp(120px, 24vmin, 200px);
    height: clamp(120px, 24vmin, 200px);
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 8px 0 var(--primary-deep),
        0 14px 30px color-mix(in srgb, var(--primary) 40%, transparent);
    transition: transform 0.1s, box-shadow 0.1s, opacity 0.2s;
}
.letters-shell .letters-speaker:active:not(:disabled) {
    transform: translateY(5px);
    box-shadow: 0 3px 0 var(--primary-deep);
}
.letters-shell .letters-speaker:disabled {
    opacity: 0.6;
}
.letters-shell .letters-speaker.speaking {
    animation: speakerRing 0.9s ease-out infinite;
}
.letters-speaker-icon {
    width: 42%;
    height: 42%;
}
.letters-speaker-label {
    font-size: 16px;
    font-weight: 800;
}
.letters-mascot-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: 20px;
    background: var(--card);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
}
.letters-shell .letters-action {
    padding: 14px 0;
    border-radius: 18px;
    background: var(--primary);
    color: #fff;
    font-size: 18px;
    font-weight: 800;
    box-shadow: 0 5px 0 var(--primary-deep);
    transition: transform 0.1s, box-shadow 0.1s, opacity 0.2s;
}
.letters-shell .letters-action:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: 0 2px 0 var(--primary-deep);
}
.letters-shell .letters-action:disabled {
    opacity: 0.5;
}

/* learn: alphabet-song grid */
.letters-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: clamp(6px, 1.2vmin, 14px);
    padding: clamp(10px, 1.8vmin, 20px);
    border-radius: 20px;
    background: var(--card);
    box-shadow: 0 10px 30px rgba(255, 111, 145, 0.1);
    min-width: 0;
    min-height: 0;
}
.letters-shell .letters-tile {
    container-type: size;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    align-content: center;
    justify-content: center;
    gap: 0.08em;
    min-width: 0;
    min-height: 0;
    border-radius: 16px;
    background: #fff;
    color: var(--tile);
    font-weight: 800;
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 5px 0 color-mix(in srgb, var(--tile) 30%, transparent);
    transition: transform 0.12s, box-shadow 0.12s, background 0.15s, color 0.15s;
}
.letters-shell .letters-tile:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 color-mix(in srgb, var(--tile) 30%, transparent);
}
.letters-shell .letters-tile.active {
    background: var(--tile);
    color: #fff;
    box-shadow: 0 5px 0 color-mix(in srgb, var(--tile) 60%, #000 15%);
}
.letters-shell .letters-tile.speaking {
    animation: tileBounce 0.45s ease-out;
}
.letters-tile-upper {
    font-size: min(52cqh, 48cqw);
}
.letters-tile-lower {
    font-size: min(40cqh, 36cqw);
    opacity: 0.7;
}

/* quiz: answer options, upper + lower case together */
.letters-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: clamp(12px, 2vmin, 22px);
    padding: clamp(12px, 2vmin, 22px);
    border-radius: 20px;
    background: var(--card);
    box-shadow: 0 10px 30px rgba(255, 111, 145, 0.1);
    min-width: 0;
    min-height: 0;
}
.letters-shell .letters-option {
    position: relative;
    container-type: size;
    min-height: 0;
    min-width: 0;
    border-radius: 24px;
    background: #fff;
    color: var(--tile);
    font-weight: 800;
    line-height: 1;
    box-shadow: 0 7px 0 color-mix(in srgb, var(--tile) 30%, transparent);
    animation: pop 0.35s ease-out both;
    transition: transform 0.12s, box-shadow 0.12s, background 0.2s, color 0.2s, opacity 0.2s;
}
.letters-shell .letters-option:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 3px 0 color-mix(in srgb, var(--tile) 30%, transparent);
}
.letters-shell .letters-option.right {
    background: #6cc76a;
    color: #fff;
    box-shadow: 0 7px 0 #3f9a3d;
    animation: tileBounce 0.5s ease-out;
}
.letters-shell .letters-option.wrong {
    background: #ff8a8a;
    color: #fff;
    box-shadow: 0 7px 0 #d65353;
    animation: mascotShake 0.4s ease-out;
}
.letters-shell .letters-option.dim {
    opacity: 0.4;
}
.letters-option-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    align-content: center;
    justify-content: center;
    gap: 0.08em;
}
.letters-option-upper {
    font-size: min(56cqh, 40cqw);
}
.letters-option-lower {
    font-size: min(42cqh, 30cqw);
    opacity: 0.75;
}
.letters-option-mark {
    position: absolute;
    top: 10px;
    right: 14px;
    font-size: 28px;
}

@keyframes tileBounce {
    0% { transform: scale(1); }
    40% { transform: scale(1.12); }
    70% { transform: scale(0.96); }
    100% { transform: scale(1); }
}
@keyframes speakerRing {
    0% { box-shadow: 0 8px 0 var(--primary-deep), 0 0 0 0 color-mix(in srgb, var(--primary) 50%, transparent); }
    100% { box-shadow: 0 8px 0 var(--primary-deep), 0 0 0 22px transparent; }
}

/* portrait tablets / narrow screens: side panel on top */
@media (max-width: 900px), (orientation: portrait) {
    .letters-shell {
        grid-template-columns: 1fr;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 14px;
    }
    .letters-shell .letters-big {
        flex: none;
        height: clamp(170px, 26vh, 320px);
    }
    .letters-shell.quiz .letters-side {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
        gap: 12px;
    }
    .letters-shell.quiz .letters-modes {
        grid-column: 1 / -1;
    }
    .letters-focus {
        padding: 10px;
        min-height: 150px;
    }
    .letters-mascot-panel {
        padding: 12px;
        justify-content: space-between;
    }
}

/* phones */
@media (max-width: 560px) {
    .letters-shell .letters-big {
        height: 160px;
    }
    .letters-shell.quiz .letters-side {
        grid-template-columns: 1fr;
    }
    .letters-focus {
        min-height: 0;
        height: 112px;
    }
    .letters-shell .letters-speaker {
        width: 92px;
        height: 92px;
        gap: 2px;
    }
    .letters-speaker-label {
        font-size: 13px;
    }
    .letters-shell .letters-mode,
    .letters-shell .letters-action {
        font-size: 16px;
        padding: 9px 0;
    }
    .letters-grid {
        border-radius: 16px;
    }
    .letters-shell .letters-tile {
        border-radius: 10px;
    }
}
</style>
