<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { animalImageSrc } from "../composables/assets.js";

const props = defineProps({
  q: Object,
  palette: Object,
});

const groups = computed(() => {
  const q = props.q;
  if (q.op === "+") {
    return [
      { kind: "a", count: q.a, animal: q.animalA },
      { kind: "b", count: q.b, animal: q.animalB },
    ];
  }
  return [
    { kind: "sub", count: q.a, animal: q.animalA, crossedFrom: q.a - q.b },
  ];
});

const totalRows = computed(() =>
  groups.value.reduce((s, g) => s + Math.max(1, Math.ceil(g.count / 10)), 0)
);

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

// dot size = min(width fits 10 per row, height fits totalRows + group separators).
// gap = 18% of dot; groupGap = 25% of dot; separator line ≈ 24px constant.
const SEP_H = 24;
const dotSize = computed(() => {
  const w = panelW.value;
  const h = panelH.value;
  if (!w || !h) return 48;

  const rows = totalRows.value;
  const numGroups = groups.value.length;
  const seps = numGroups - 1;
  // gaps inside groups: each group has (rowsInGroup - 1) row gaps; sum = totalRows - numGroups.
  const innerRowGaps = Math.max(0, rows - numGroups);

  // width:  10*s + 9*0.18*s
  const sW = w / (10 + 9 * 0.18);
  // height: rows*s + innerRowGaps*0.18*s + seps*(2*0.25*s + SEP_H)
  const sH = (h - seps * SEP_H) / (rows + innerRowGaps * 0.18 + seps * 0.5);

  return Math.max(16, Math.min(sW, sH, 84));
});

const gap = computed(() => Math.max(4, Math.round(dotSize.value * 0.18)));
const groupGap = computed(() => Math.round(dotSize.value * 0.25));

function rowsOf(g) {
  const rows = [];
  for (let i = 0; i < g.count; i += 10) {
    rows.push(Array.from({ length: Math.min(10, g.count - i) }, (_, j) => i + j));
  }
  return rows;
}

function isRemoved(g, idx) {
  return g.kind === "sub" && idx >= g.crossedFrom;
}

function animalSrc(id) {
  return animalImageSrc(id);
}
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
      flexDirection: 'column',
      gap: groupGap + 'px',
      alignItems: 'stretch',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: 0,
      boxSizing: 'border-box',
    }"
  >
    <template v-for="(g, gi) in groups" :key="gi">
      <div
        :style="{
          display: 'flex',
          flexDirection: 'column',
          gap: gap + 'px',
          width: dotSize * 10 + gap * 9 + 'px',
          maxWidth: '100%',
        }"
      >
        <div
          v-for="(row, ri) in rowsOf(g)"
          :key="ri"
          :style="{ display: 'flex', gap: gap + 'px', justifyContent: 'flex-start' }"
        >
          <div
            v-for="idx in row"
            :key="idx"
            :style="{
              width: dotSize + 'px',
              height: dotSize + 'px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }"
          >
            <img
              :src="animalSrc(g.animal)"
              :alt="g.animal"
              :style="{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                filter: isRemoved(g, idx) ? 'grayscale(1)' : 'none',
                opacity: isRemoved(g, idx) ? 0.4 : 1,
              }"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
