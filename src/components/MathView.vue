<script setup>
import QuestionCard from "./QuestionCard.vue";
import Keypad from "./Keypad.vue";
import DotVisual from "./DotVisual.vue";
import FormulaView from "./FormulaView.vue";
import Mascot from "./Mascot.vue";

const props = defineProps({
  q: Object,
  input: String,
  status: String,
  palette: Object,
  tweaks: Object,
  viewMode: String,
  mascotMood: String,
  mascotMsg: String,
});
const emit = defineEmits(["digit", "delete", "submit", "skip", "view-mode"]);

const MODES = ["animal", "formula"];
const SWIPE_THRESHOLD = 60;

function onSwipeStart(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const startX = e.clientX;
  let dx = 0;
  const onMove = (ev) => { dx = ev.clientX - startX; };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    const idx = MODES.indexOf(props.viewMode);
    const nextIdx = dx < 0
      ? (idx + 1) % MODES.length
      : (idx - 1 + MODES.length) % MODES.length;
    emit("view-mode", MODES[nextIdx]);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
}
</script>

<template>
  <div
    class="math-shell"
    :style="{
      '--math-columns': tweaks.showVisual ? '1fr 1.4fr' : '1fr',
    }"
  >
    <div class="math-control-column">
      <QuestionCard :q="q" :input="input" :status="status" :palette="palette" />

      <div
        class="math-control-panel"
        :style="{
          background: palette.card,
        }"
      >
        <Mascot :mood="mascotMood" :message="mascotMsg" :palette="palette" />
        <Keypad
          :palette="palette"
          :disabled="!!status"
          @digit="(n) => emit('digit', n)"
          @delete="emit('delete')"
          @submit="emit('submit')"
        />
      </div>
    </div>

    <div
      v-if="tweaks.showVisual"
      class="math-visual-panel"
      @pointerdown="onSwipeStart"
    >
      <DotVisual
        v-if="viewMode === 'animal'"
        :q="q"
        :palette="palette"
      />
      <FormulaView
        v-else
        :q="q"
        :input="input"
        :status="status"
        :palette="palette"
      />

      <div
        :style="{
          position: 'absolute',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          pointerEvents: 'none',
        }"
      >
        <span
          v-for="m in MODES"
          :key="m"
          :style="{
            width: viewMode === m ? '22px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: viewMode === m ? palette.primary : palette.bgSoft,
            transition: 'all 0.2s',
          }"
        />
      </div>
    </div>
  </div>
</template>
