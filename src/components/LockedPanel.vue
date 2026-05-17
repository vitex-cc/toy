<script setup>
import { computed } from "vue";

const props = defineProps({
  which: String,
  palette: Object,
});
const emit = defineEmits(["back"]);

const conf = computed(() =>
  props.which === "letters"
    ? { title: "认识字母", emoji: "🔤", sample: "A B C D E F G" }
    : { title: "学拼音", emoji: "🔡", sample: "ā á ǎ à  ō ó ǒ ò" }
);
</script>

<template>
  <div
    :style="{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px',
      background: palette.card,
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(255,111,145,0.10)',
    }"
  >
    <div style="font-size: 96px;">{{ conf.emoji }}</div>
    <div :style="{ fontSize: '40px', fontWeight: 800, color: palette.ink }">
      {{ conf.title }}
    </div>
    <div
      :style="{
        fontSize: '28px',
        color: palette.inkSoft,
        letterSpacing: '6px',
        fontWeight: 600,
      }"
    >{{ conf.sample }}</div>
    <div
      :style="{
        background: palette.bgSoft,
        color: palette.primaryDeep,
        padding: '10px 22px',
        borderRadius: '20px',
        fontWeight: 700,
        fontSize: '16px',
      }"
    >🔒 即将开放，敬请期待</div>
    <button
      @click="emit('back')"
      :style="{
        background: palette.primary,
        color: '#fff',
        border: 'none',
        padding: '14px 32px',
        fontSize: '18px',
        fontWeight: 700,
        borderRadius: '24px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: `0 6px 0 ${palette.primaryDeep}`,
      }"
    >返回加减法</button>
  </div>
</template>
