<template>
  <div :class="['banner', `banner--${type}`]">
    <q-icon :name="resolvedIcon" class="banner-icon" />
    <div class="banner-message">
      <slot>{{ message }}</slot>
    </div>
    <q-btn
      v-if="closable"
      flat
      round
      dense
      icon="mdi-close"
      size="sm"
      @click="$emit('close')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'BannerInfo' })

const props = defineProps({
  message: { type: String, default: '' },
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'success', 'warning', 'critical'].includes(v),
  },
  icon: { type: String, default: '' },
  closable: { type: Boolean, default: false },
})

defineEmits(['close'])

const DEFAULT_ICONS = {
  info: 'mdi-information',
  success: 'mdi-check-circle',
  warning: 'mdi-alert',
  critical: 'mdi-alert-octagon',
}

const resolvedIcon = computed(
  () => props.icon || DEFAULT_ICONS[props.type] || 'mdi-information',
)
</script>

<style scoped>
.banner {
  --_bg: var(--banner-bg);
  --_border: var(--banner-border);
  --_color: var(--banner-color);
  --_icon: var(--banner-icon);

  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: var(--radius, 12px);
  box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--_border);
  gap: 16px;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  background: var(--_bg);
  color: var(--_color);
}

.banner-icon {
  font-size: 24px;
  flex-shrink: 0;
  color: var(--_icon);
}

.banner-message {
  flex-grow: 1;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

/* --- Variants (light) --- */
.banner--info {
  --banner-bg: rgba(14, 165, 233, 0.1);
  --banner-border: rgba(14, 165, 233, 0.2);
  --banner-color: #0c4a6e;
  --banner-icon: #0284c7;
}

.banner--success {
  --banner-bg: rgba(34, 197, 94, 0.1);
  --banner-border: rgba(34, 197, 94, 0.2);
  --banner-color: #14532d;
  --banner-icon: #16a34a;
}

.banner--warning {
  --banner-bg: rgba(245, 158, 11, 0.1);
  --banner-border: rgba(245, 158, 11, 0.2);
  --banner-color: #78350f;
  --banner-icon: #d97706;
}

.banner--critical {
  --banner-bg: rgba(239, 68, 68, 0.1);
  --banner-border: rgba(239, 68, 68, 0.2);
  --banner-color: #7f1d1d;
  --banner-icon: #dc2626;
}

/* --- Dark mode --- */
[data-theme='dark'] .banner--info {
  --banner-bg: rgba(14, 165, 233, 0.15);
  --banner-border: rgba(14, 165, 233, 0.3);
  --banner-color: #bae6fd;
  --banner-icon: #38bdf8;
}

[data-theme='dark'] .banner--success {
  --banner-bg: rgba(34, 197, 94, 0.15);
  --banner-border: rgba(34, 197, 94, 0.3);
  --banner-color: #bbf7d0;
  --banner-icon: #4ade80;
}

[data-theme='dark'] .banner--warning {
  --banner-bg: var(--warning-surface, rgba(254, 218, 0, 0.1));
  --banner-border: rgba(254, 218, 0, 0.2);
  --banner-color: var(--brand-tertiary, #feda00);
  --banner-icon: var(--brand-tertiary, #feda00);
}

[data-theme='dark'] .banner--critical {
  --banner-bg: rgba(239, 68, 68, 0.15);
  --banner-border: rgba(239, 68, 68, 0.3);
  --banner-color: #fca5a5;
  --banner-icon: #f87171;
}
</style>
