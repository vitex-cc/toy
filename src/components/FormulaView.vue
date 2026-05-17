<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  q: Object,
  input: String,
  status: String,
  palette: Object,
});

const panelRef = ref(null);
const panelW = ref(0);
const panelH = ref(0);

let ro = null;
onMounted(() => {
  ro = new ResizeObserver((entries) => {
    const r = entries[0].contentRect;
    panelW.value = r.width;
    panelH.value = r.height;
  });
  ro.observe(panelRef.value);
});
onUnmounted(() => ro && ro.disconnect());

const maxDigits = computed(() => {
  const a = String(props.q.a).length;
  const b = String(props.q.b).length;
  const ans = String(props.q.answer).length;
  return Math.max(a, b, ans);
});

// font size based on panel space: 4 lines tall, (maxDigits + 1) cells wide.
const fontSize = computed(() => {
  const w = panelW.value;
  const h = panelH.value;
  if (!w || !h) return 120;
  const colWidth = 0.62; // digit cell width as ratio of font size
  const opWidth = 0.85;  // operator cell width as ratio of font size
  const widthDivisor = maxDigits.value * colWidth + opWidth;
  const sW = w / widthDivisor;
  const sH = (h - 24) / 2.85;
  return Math.floor(Math.max(48, Math.min(sW, sH, 240)));
});

const digitCellStyle = computed(() => ({
  display: "inline-block",
  width: (fontSize.value * 0.62) + "px",
  textAlign: "center",
  lineHeight: 0.85,
}));

const opCellStyle = computed(() => ({
  display: "inline-block",
  width: (fontSize.value * 0.85) + "px",
  textAlign: "center",
  lineHeight: 0.85,
}));

function digits(n) {
  const s = String(n);
  return Array.from({ length: maxDigits.value }, (_, i) => {
    const idx = i - (maxDigits.value - s.length);
    return idx < 0 ? "" : s[idx];
  });
}

const answerDigits = computed(() => {
  if (props.input === "") return null;
  return digits(props.input);
});

const answerColor = computed(() => {
  if (props.status === "correct") return "#3aa53a";
  if (props.status === "wrong") return "#ff7373";
  return props.palette.primary;
});

const hrStyle = computed(() => ({
  borderTop: `${Math.max(3, fontSize.value * 0.05)}px solid ${props.palette.primaryDeep}`,
  margin: `${Math.round(fontSize.value * 0.06)}px 0`,
}));
</script>

<template>
  <div
    ref="panelRef"
    :style="{
      height: '100%',
      background: palette.card,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 10px 30px rgba(255,111,145,0.10)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: 0,
      boxSizing: 'border-box',
    }"
  >
    <div
      :style="{
        fontWeight: 800,
        fontSize: fontSize + 'px',
        lineHeight: 0.85,
        color: palette.ink,
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-flex',
        flexDirection: 'column',
      }"
    >
      <div>
        <span :style="opCellStyle" />
        <span
          v-for="(d, i) in digits(q.a)"
          :key="'a' + i"
          :style="{ ...digitCellStyle, color: palette.dotA }"
        >{{ d }}</span>
      </div>
      <div>
        <span :style="{ ...opCellStyle, color: palette.primaryDeep }">{{ q.op }}</span>
        <span
          v-for="(d, i) in digits(q.b)"
          :key="'b' + i"
          :style="{ ...digitCellStyle, color: palette.dotB }"
        >{{ d }}</span>
      </div>
      <div :style="hrStyle" />
      <div>
        <span :style="opCellStyle" />
        <template v-if="answerDigits">
          <span
            v-for="(d, i) in answerDigits"
            :key="'r' + i"
            :style="{ ...digitCellStyle, color: answerColor }"
          >{{ d }}</span>
        </template>
        <template v-else>
          <span
            v-for="i in maxDigits - 1"
            :key="'p' + i"
            :style="digitCellStyle"
          />
          <span :style="{ ...digitCellStyle, color: palette.inkSoft, opacity: 0.35 }">?</span>
        </template>
      </div>
    </div>
  </div>
</template>
