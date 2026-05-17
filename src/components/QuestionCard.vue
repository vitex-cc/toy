<script setup>
import { computed } from "vue";

const props = defineProps({
  q: Object,
  input: String,
  status: String,
  palette: Object,
});

const slotBg = computed(() =>
  props.status === "correct" ? "#c8f0c8"
  : props.status === "wrong" ? "#ffd9d9"
    : props.palette.primary + "22"
);
</script>

<template>
  <div
    :style="{
      background: palette.card,
      borderRadius: '20px',
      padding: '22px 24px',
      boxShadow: '0 10px 30px rgba(255,111,145,0.12)',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <div
      :style="{
        position: 'absolute',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: palette.bgSoft,
        top: '-40px',
        right: '-40px',
        opacity: 0.6,
      }"
    />
    <div
      :style="{
        position: 'absolute',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: palette.bgSoft,
        bottom: '-30px',
        left: '-20px',
        opacity: 0.5,
      }"
    />

    <div
      :style="{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '56px',
        fontWeight: 800,
        color: palette.ink,
        lineHeight: 1,
        letterSpacing: '-1px',
      }"
    >
      <span
        :style="{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '80px',
          height: '80px',
          padding: '0 14px',
          borderRadius: '18px',
          background: palette.dotA + '22',
          color: palette.dotA,
          fontWeight: 800,
          fontSize: '54px',
        }"
      >{{ q.a }}</span>
      <span :style="{ color: palette.primaryDeep, fontSize: '44px' }">{{ q.op }}</span>
      <span
        :style="{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '80px',
          height: '80px',
          padding: '0 14px',
          borderRadius: '18px',
          background: palette.dotB + '22',
          color: palette.dotB,
          fontWeight: 800,
          fontSize: '54px',
        }"
      >{{ q.b }}</span>
      <span :style="{ color: palette.inkSoft, fontSize: '44px' }">=</span>
      <div
        :style="{
          minWidth: '80px',
          height: '80px',
          borderRadius: '18px',
          background: slotBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: palette.primary,
          fontSize: '54px',
          fontWeight: 800,
          padding: '0 14px',
          transition: 'all 0.2s',
        }"
      >
        <span v-if="input === ''" :style="{ color: palette.inkSoft, opacity: 0.35, fontSize: '44px' }">?</span>
        <template v-else>{{ input }}</template>
      </div>
    </div>
  </div>
</template>
