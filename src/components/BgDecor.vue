<script setup>
import { watch, ref } from "vue";

const props = defineProps({
  palette: Object,
});

const dots = ref([]);

function regen() {
  dots.value = Array.from({ length: 14 }, (_, i) => ({
    x: Math.random() * 1180,
    y: Math.random() * 820,
    r: 30 + Math.random() * 60,
    c: i % 2 ? props.palette.dotA : props.palette.dotB,
  }));
}

watch(() => props.palette, regen, { immediate: true });
</script>

<template>
  <svg
    width="1180"
    height="820"
    style="position: absolute; inset: 0; z-index: 1; pointer-events: none;"
  >
    <circle
      v-for="(d, i) in dots"
      :key="i"
      :cx="d.x"
      :cy="d.y"
      :r="d.r"
      :fill="d.c"
      opacity="0.06"
    />
  </svg>
</template>
