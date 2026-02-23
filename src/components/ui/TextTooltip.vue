<template>
  <div class="text-tooltip-container">
    <div ref="textRef" class="text-content" :class="textClass">
      {{ text }}
    </div>
    <q-tooltip v-if="isOverflowing" :class="tooltipClass" :offset="[0, 4]">
      {{ text }}
    </q-tooltip>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  text: {
    type: String,
    required: true,
  },
  textClass: {
    type: String,
    default: '',
  },
  tooltipClass: {
    type: String,
    default: 'text-body2',
  },
})

const textRef = ref(null)
const isOverflowing = ref(false)
let resizeObserver = null

const checkOverflow = () => {
  const el = textRef.value
  if (el) {
    // We add a small buffer (1px) to avoid false positives due to sub-pixel rendering
    isOverflowing.value = el.scrollWidth > el.clientWidth + 1
  }
}

onMounted(() => {
  checkOverflow()

  if (textRef.value) {
    resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(textRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.text-tooltip-container {
  min-width: 0; /* Allows shrinking in flex container */
  position: relative;
  display: flex; /* Matches flex child behavior */
  flex: 1; /* Automatically grow/shrink if needed, can be overridden */
  overflow: hidden;
}

.text-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  min-width: 0; /* Critical for shrinking in flex context */
}
</style>
