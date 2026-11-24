<script setup>
defineProps({
    // Animate the sound waves while audio is playing.
    active: Boolean,
});
</script>

<template>
    <svg
        class="speaker-icon"
        :class="{ active }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path
            d="M3.5 10v4a1.5 1.5 0 0 0 1.5 1.5h2.4l4.1 3.4a1 1 0 0 0 1.6-.8V5.9a1 1 0 0 0-1.6-.8L7.4 8.5H5A1.5 1.5 0 0 0 3.5 10z"
            fill="currentColor"
        />
        <path class="speaker-wave w1" d="M16 9.2a4 4 0 0 1 0 5.6" />
        <path class="speaker-wave w2" d="M18.9 6.4a8 8 0 0 1 0 11.2" />
    </svg>
</template>

<style scoped>
.speaker-icon {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}
.speaker-wave {
    transition: opacity 0.2s;
}
.active .speaker-wave {
    animation: wave 0.9s ease-in-out infinite;
}
.active .w2 {
    animation-delay: 0.18s;
}
@keyframes wave {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.15; }
}
</style>
