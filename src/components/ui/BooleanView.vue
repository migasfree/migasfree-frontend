<template>
  <div
    class="boolean-view-wrapper"
    :class="{ 'is-true': value, 'is-false': !value }"
  >
    <q-icon
      :name="iconName"
      :color="iconColor"
      size="1.2rem"
      class="boolean-icon"
    />
    <div class="boolean-label">
      {{ label || tooltipText }}
    </div>
    <q-tooltip v-if="tooltip" class="glass-tooltip">
      {{ tooltip }}
    </q-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { appIcon } from 'composables/element'

const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  tooltip: {
    type: String,
    default: '',
  },
})

const { $gettext } = useGettext()

const iconName = computed(() => appIcon(props.value ? 'yes' : 'no'))

const iconColor = computed(() => (props.value ? 'positive' : 'negative'))

const tooltipText = computed(() => $gettext(props.value ? 'Yes' : 'No'))
</script>

<style scoped>
.boolean-view-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 20px;
  background: rgba(var(--brand-primary-rgb), 0.03);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
  transition: all 0.3s ease;
  height: 28px;
}

[data-theme='dark'] .boolean-view-wrapper {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.boolean-view-wrapper.is-true {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.boolean-view-wrapper.is-false {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.boolean-label {
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  color: var(--text-main);
  opacity: 0.9;
  line-height: 1;
}

.boolean-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}
</style>
