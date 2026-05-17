<script setup>
const props = defineProps({
  palette: Object,
  disabled: Boolean,
});
const emit = defineEmits(["digit", "delete", "submit"]);

const variants = (palette) => ({
  digit: { bg: "#fff", color: palette.ink, shadow: "0 6px 0 #00000010" },
  delete: { bg: "#fff1d6", color: "#c97a00", shadow: "0 6px 0 #c97a0020" },
  submit: { bg: palette.primary, color: "#fff", shadow: `0 6px 0 ${palette.primaryDeep}` },
});

function btnStyle(variant) {
  const v = variants(props.palette)[variant];
  return {
    background: v.bg,
    color: v.color,
    border: "none",
    borderRadius: "18px",
    fontSize: "34px",
    fontWeight: 800,
    fontFamily: "inherit",
    padding: 0,
    minHeight: 0,
    cursor: props.disabled ? "not-allowed" : "pointer",
    boxShadow: v.shadow,
    transition: "transform 0.08s",
    opacity: props.disabled ? 0.5 : 1,
  };
}

function press(e) {
  if (!props.disabled) e.currentTarget.style.transform = "translateY(3px)";
}
function release(e) {
  e.currentTarget.style.transform = "translateY(0)";
}
</script>

<template>
  <div
    style="
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 14px;
      min-height: 0;
    "
  >
    <button
      v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
      :key="n"
      @click="emit('digit', n)"
      :disabled="disabled"
      :aria-label="`数字${n}`"
      :style="btnStyle('digit')"
      @pointerdown="press"
      @pointerup="release"
      @pointerleave="release"
    >{{ n }}</button>

    <button
      @click="emit('delete')"
      :disabled="disabled"
      aria-label="删除"
      :style="btnStyle('delete')"
      @pointerdown="press"
      @pointerup="release"
      @pointerleave="release"
    >⌫</button>

    <button
      @click="emit('digit', 0)"
      :disabled="disabled"
      aria-label="数字0"
      :style="btnStyle('digit')"
      @pointerdown="press"
      @pointerup="release"
      @pointerleave="release"
    >0</button>

    <button
      @click="emit('submit')"
      :disabled="disabled"
      aria-label="确认"
      :style="btnStyle('submit')"
      @pointerdown="press"
      @pointerup="release"
      @pointerleave="release"
    >✓</button>
  </div>
</template>
