<script setup>
import { computed } from "vue";
import { mascotImageSrc } from "../composables/assets.js";

const props = defineProps({
    mood: String,
    message: String,
    palette: Object,
});

const moodFile = computed(() =>
    props.mood === "cheer"
        ? "cheer"
        : props.mood === "sad"
          ? "sad"
          : props.mood === "happy"
            ? "happy"
            : "idle",
);

const mascotSrc = computed(() => mascotImageSrc(moodFile.value));

const bubbleBg = computed(() =>
    props.mood === "happy" || props.mood === "cheer"
        ? "#fff9e1"
        : props.mood === "sad"
          ? "#eaf1ff"
          : "#ffffff",
);

const bubbleBorder = computed(() =>
    props.mood === "happy" || props.mood === "cheer"
        ? "#ffd07a"
        : props.mood === "sad"
          ? "#a9c1ee"
          : props.palette.bgSoft,
);

const bubbleColor = computed(() =>
    props.mood === "sad"
        ? "#2d3a64"
        : props.mood === "happy" || props.mood === "cheer"
          ? "#6a4316"
          : props.palette.ink,
);

const mascotAnimation = computed(() =>
    props.mood === "happy" || props.mood === "cheer"
        ? "mascotJump 0.6s ease-out"
        : props.mood === "sad"
          ? "mascotShake 0.4s ease-out"
          : "mascotBob 2.6s ease-in-out infinite",
);
</script>

<template>
    <div style="display: flex; align-items: stretch; gap: 12px; min-height: 0">
        <div
            :key="moodFile"
            :style="{
                width: '72px',
                height: '72px',
                flexShrink: 0,
                borderRadius: '18px',
                background: palette.cardWarm,
                boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                animation: mascotAnimation,
            }"
        >
            <img
                :src="mascotSrc"
                :alt="`小兔-${moodFile}`"
                style="width: 100%; height: 100%; display: block"
            />
        </div>

        <div
            :key="message"
            :style="{
                flex: 1,
                minWidth: 0,
                position: 'relative',
                background: bubbleBg,
                border: `2px solid ${bubbleBorder}`,
                borderRadius: '22px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                color: bubbleColor,
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: 1.3,
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                animation: 'bubbleIn 0.35s ease-out',
            }"
        >
            <span
                :style="{
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    width: '16px',
                    height: '16px',
                    transform: 'translateY(-50%) rotate(45deg)',
                    background: bubbleBg,
                    borderLeft: `2px solid ${bubbleBorder}`,
                    borderBottom: `2px solid ${bubbleBorder}`,
                }"
            />
            <span style="position: relative">{{ message }}</span>
        </div>
    </div>
</template>
