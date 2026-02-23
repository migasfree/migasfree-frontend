<template>
  <q-btn
    :flat="flat"
    :round="round"
    :dense="dense"
    :size="size"
    class="action-btn"
    :class="{ 'is-success': isSuccess }"
    :aria-label="currentTooltip"
    @click.stop="handleClick"
  >
    <div class="icon-wrapper">
      <q-transition
        enter-active-class="animated zoomIn"
        leave-active-class="animated zoomOut"
        mode="out-in"
      >
        <q-icon
          :key="isSuccess ? 'success' : 'default'"
          :name="currentIcon"
          :color="currentColor"
          size="1.2em"
        />
      </q-transition>
    </div>

    <q-tooltip
      v-if="tooltip"
      anchor="top middle"
      self="bottom middle"
      :offset="[0, 8]"
      class="glass-tooltip"
    >
      {{ currentTooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({ name: 'MicroInteractionButton' })

const props = defineProps({
  icon: { type: String, required: true },
  successIcon: { type: String, required: true },
  tooltip: { type: String, default: '' },
  successTooltip: { type: String, default: '' },
  action: { type: Function, required: true },
  flat: { type: Boolean, default: true },
  round: { type: Boolean, default: true },
  dense: { type: Boolean, default: true },
  size: { type: String, default: 'sm' },
  color: { type: String, default: 'primary' },
  successColor: { type: String, default: 'positive' },
  timeout: { type: Number, default: 2000 },
})

const isSuccess = ref(false)

const currentIcon = computed(() =>
  isSuccess.value ? props.successIcon : props.icon,
)
const currentColor = computed(() =>
  isSuccess.value ? props.successColor : props.color,
)
const currentTooltip = computed(() =>
  isSuccess.value ? props.successTooltip : props.tooltip,
)

const handleClick = async () => {
  if (isSuccess.value) return

  try {
    await props.action()
    isSuccess.value = true
    setTimeout(() => {
      isSuccess.value = false
    }, props.timeout)
  } catch (error) {
    console.error('MicroInteractionButton action failed:', error)
  }
}
</script>

<style scoped>
.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.action-btn:not(.is-success) {
  opacity: 0.6;
}

.action-btn:hover:not(.is-success) {
  opacity: 1;
  background: rgba(var(--brand-primary-rgb), 0.05);
  transform: translateY(-1px) scale(1.1);
}

[data-theme='dark'] .action-btn:hover:not(.is-success) {
  background: rgba(255, 255, 255, 0.05);
}

.action-btn.is-success {
  opacity: 1;
  background: rgba(var(--success-rgb, 33, 196, 77), 0.1);
  box-shadow: 0 0 15px rgba(var(--success-rgb, 33, 196, 77), 0.2);
}

[data-theme='dark'] .action-btn.is-success {
  background: rgba(var(--brand-tertiary-rgb), 0.1);
  box-shadow: 0 0 15px rgba(var(--brand-tertiary-rgb), 0.3);
}

.icon-wrapper {
  position: relative;
  width: 1.2em;
  height: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
