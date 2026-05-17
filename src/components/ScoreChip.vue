<script setup>
defineProps({
  correct: Number,
  total: Number,
  streak: Number,
  palette: Object,
});
</script>

<template>
  <div
    class="score-chip"
    :style="{
      background: palette.card,
    }"
  >
    <div style="text-align: center;">
      <div :style="{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }">
        已答对
      </div>
      <div
        :style="{
          fontSize: '22px',
          fontWeight: 800,
          color: palette.primaryDeep,
          lineHeight: 1,
          marginTop: '2px',
        }"
      >
        {{ correct }}<span :style="{ fontSize: '14px', color: palette.inkSoft }">/{{ total }}</span>
      </div>
    </div>
    <div :style="{ width: '1px', height: '28px', background: palette.bgSoft }" />
    <div style="text-align: center; display: flex; align-items: center; gap: 6px;">
      <span style="font-size: 22px;">🔥</span>
      <div>
        <div :style="{ fontSize: '11px', color: palette.inkSoft, fontWeight: 600 }">连对</div>
        <div
          :style="{
            fontSize: '22px',
            fontWeight: 800,
            color: palette.accent,
            lineHeight: 1,
            marginTop: '2px',
          }"
        >{{ streak }}</div>
      </div>
    </div>
  </div>
</template>
