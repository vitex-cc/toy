<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { PALETTES } from "./composables/palettes.js";
import { Sound } from "./composables/sound.js";
import {
    genQuestion,
    pickMsg,
    MASCOT_MESSAGES,
} from "./composables/question.js";
import { speak, prewarm } from "./composables/tts.js";
import { mascotImageSrc } from "./composables/assets.js";

import TopTabs from "./components/TopTabs.vue";
import ScoreChip from "./components/ScoreChip.vue";
import MathView from "./components/MathView.vue";
import LockedPanel from "./components/LockedPanel.vue";
import BgDecor from "./components/BgDecor.vue";

const tweaks = {
    opMode: "mixed",
    maxNumber: 20,
    showVisual: true,
    palette: "strawberry",
    soundOn: true,
};

const palette = PALETTES[tweaks.palette];

const FONT_STACK =
    '"Baloo 2", "Quicksand", "PingFang SC", "Hiragino Sans GB", sans-serif';

const rootStyle = {
    width: "100%",
    height: "100%",
    background: palette.bg,
    fontFamily: FONT_STACK,
    color: palette.ink,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
};

function play(name) {
    if (!tweaks.soundOn) return;
    Sound[name] && Sound[name]();
}

const tab = ref("math");
const viewMode = ref("animal");
const q = ref(
    genQuestion({ opMode: tweaks.opMode, maxNumber: tweaks.maxNumber }),
);
const input = ref("");
const status = ref(null);
const correct = ref(0);
const total = ref(0);
const streak = ref(0);
const mascotMood = ref("idle");
const mascotMsg = ref(pickMsg("idle"));

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function nextQuestion() {
    q.value = genQuestion({
        opMode: tweaks.opMode,
        maxNumber: tweaks.maxNumber,
    });
    input.value = "";
    status.value = null;
    mascotMood.value = "idle";
    mascotMsg.value = pickMsg("idle");
    play("next");
    speak(mascotMsg.value);
}

function handleDigit(n) {
    if (status.value) return;
    play("key");
    const v = input.value;
    let next = (v + n).slice(0, 3);
    if (next.length > 1 && next.startsWith("0")) next = next.replace(/^0+/, "");
    input.value = next;
}

function handleDelete() {
    if (status.value) return;
    play("del");
    input.value = input.value.slice(0, -1);
}

async function handleSubmit() {
    if (status.value) return;
    if (input.value === "") return;
    const val = parseInt(input.value, 10);
    if (val === q.value.answer) {
        const nextStreak = streak.value + 1;
        status.value = "correct";
        correct.value += 1;
        total.value += 1;
        streak.value = nextStreak;
        const mood = nextStreak >= 3 ? "cheer" : "happy";
        mascotMood.value = mood;
        mascotMsg.value = pickMsg(mood);
        play("correct");
        await speak(mascotMsg.value);
        await delay(300);
        nextQuestion();
    } else {
        status.value = "wrong";
        total.value += 1;
        streak.value = 0;
        mascotMood.value = "sad";
        mascotMsg.value = pickMsg("wrong");
        play("wrong");
        await speak(mascotMsg.value);
        await delay(300);
        nextQuestion();
    }
}

function onKey(e) {
    if (tab.value !== "math") return;
    if (e.key >= "0" && e.key <= "9") handleDigit(parseInt(e.key, 10));
    else if (e.key === "Backspace") handleDelete();
    else if (e.key === "Enter") handleSubmit();
}

onMounted(() => {
    window.addEventListener("keydown", onKey);
    // pre-warm static phrases so the first time each plays it doesn't lag.
    prewarm(Object.values(MASCOT_MESSAGES).flat());
});
onUnmounted(() => window.removeEventListener("keydown", onKey));

function changeTab(t) {
    play("tab");
    tab.value = t;
}
function lockedTab() {
    play("locked");
}
</script>

<template>
    <div :style="rootStyle" data-screen-label="01 加减法练习">
        <BgDecor :palette="palette" />

        <div class="app-topbar">
            <div class="app-brand">
                <div
                    class="app-logo"
                    :style="{
                        background: palette.primary,
                        boxShadow: `0 6px 16px ${palette.primary}55`,
                    }"
                >
                    <img
                        :src="mascotImageSrc('idle')"
                        alt="小兔学堂"
                        style="
                            width: 100%;
                            height: 100%;
                            display: block;
                            object-fit: cover;
                        "
                    />
                </div>
                <div class="app-title">小兔学堂</div>
            </div>

            <TopTabs
                :active="tab"
                :palette="palette"
                @change="changeTab"
                @locked="lockedTab"
            />

            <ScoreChip
                :correct="correct"
                :total="total"
                :streak="streak"
                :palette="palette"
            />
        </div>

        <div class="app-main">
            <MathView
                v-if="tab === 'math'"
                :q="q"
                :input="input"
                :status="status"
                :palette="palette"
                :tweaks="tweaks"
                :view-mode="viewMode"
                :mascot-mood="mascotMood"
                :mascot-msg="mascotMsg"
                @digit="handleDigit"
                @delete="handleDelete"
                @submit="handleSubmit"
                @skip="nextQuestion"
                @view-mode="(m) => (viewMode = m)"
            />
            <LockedPanel
                v-else
                :which="tab"
                :palette="palette"
                @back="tab = 'math'"
            />
        </div>
    </div>
</template>
