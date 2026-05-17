<script setup>
defineProps({
  active: String,
  palette: Object,
});
const emit = defineEmits(["change", "locked"]);

const tabs = [
  { id: "math", label: "加减法", sub: "20以内", icon: "➕", ready: true },
  { id: "letters", label: "字母", sub: "ABC", icon: "🔤", ready: false },
  { id: "pinyin", label: "拼音", sub: "ā á ǎ à", icon: "🔡", ready: false },
];

function click(t) {
  if (t.ready) emit("change", t.id);
  else emit("locked");
}
</script>

<template>
  <div class="top-tabs">
    <button
      v-for="t in tabs"
      :key="t.id"
      class="top-tab"
      @click="click(t)"
      :style="{
        background: active === t.id ? palette.primary : '#fff',
        color: active === t.id ? '#fff' : t.ready ? palette.ink : palette.inkSoft,
        boxShadow: active === t.id
          ? `0 8px 20px ${palette.primary}55`
          : '0 4px 12px rgba(0,0,0,0.05)',
        opacity: t.ready ? 1 : 0.55,
      }"
    >
      <span class="top-tab-icon">{{ t.icon }}</span>
      <div style="text-align: left; line-height: 1.1; min-width: 0;">
        <div class="top-tab-label">{{ t.label }}</div>
      </div>
      <span
        v-if="!t.ready"
        class="top-tab-lock"
      >🔒</span>
    </button>
  </div>
</template>
