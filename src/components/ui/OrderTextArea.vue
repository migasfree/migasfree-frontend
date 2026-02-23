<template>
  <div class="order-textarea-wrapper">
    <q-input
      v-model="content"
      autogrow
      type="textarea"
      :label="label"
      class="order-textarea"
    >
      <template #prepend>
        <slot name="prepend">
          <q-icon name="mdi-text-box-outline" class="opacity-50" />
        </slot>
      </template>

      <template #append>
        <div class="column q-gutter-y-xs items-center">
          <q-btn
            flat
            round
            dense
            icon="mdi-order-alphabetical-ascending"
            class="action-btn sort-btn"
            @click.stop="orderAlpha"
          >
            <q-tooltip class="glass-tooltip" :offset="[0, 8]">
              {{ $gettext('Order Alphabetically') }}
            </q-tooltip>
          </q-btn>

          <div v-if="lineCount" class="line-badge text-weight-bold">
            {{ lineCount }}
          </div>
        </div>
      </template>

      <template v-if="lineCount" #hint>
        {{
          $ngettext(
            '%{ number } line detected',
            '%{ number } lines detected',
            lineCount,
            { number: lineCount },
          )
        }}
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

defineOptions({ name: 'OrderTextArea' })

const { $gettext, $ngettext } = useGettext()

const props = defineProps({
  modelValue: { type: [String, Array, null], required: true },
  label: { type: String, required: true },
})

const emit = defineEmits(['update:model-value'])

// --- Helpers ---

const nonEmptyLines = (text) =>
  text
    .trim()
    .split('\n')
    .filter((l) => l.trim() !== '')

// --- Computed ---

const content = computed({
  get: () =>
    Array.isArray(props.modelValue)
      ? props.modelValue.join('\n')
      : props.modelValue || '',
  set: (val) =>
    emit(
      'update:model-value',
      Array.isArray(props.modelValue) ? val.split('\n') : val,
    ),
})

const lineCount = computed(() => {
  const val = content.value
  return typeof val === 'string' && val.trim() ? nonEmptyLines(val).length : 0
})

// --- Actions ---

const orderAlpha = () => {
  if (!content.value) return
  content.value = nonEmptyLines(content.value)
    .sort((a, b) => a.localeCompare(b))
    .join('\n')
}
</script>

<style scoped>
.order-textarea-wrapper {
  width: 100%;
}

.order-textarea {
  transition: all 0.3s ease;
}

:deep(.q-field__control) {
  background: rgba(var(--brand-primary-rgb), 0.04);
  border-radius: var(--radius, 14px);
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

/* Focus */
.order-textarea:focus-within :deep(.q-field__control) {
  background: white;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px rgba(var(--brand-primary-rgb), 0.1);
}

[data-theme='dark'] .order-textarea:focus-within :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--brand-tertiary, #fbbf24);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

:deep(.q-field__label) {
  font-weight: 600;
  opacity: 0.8;
}

:deep(.q-field__native) {
  font-weight: 700;
  line-height: 1.5;
  padding: 8px 0;
}

.action-btn {
  color: var(--brand-primary);
  opacity: 0.6;
  transition: all 0.3s ease;
}

[data-theme='dark'] .action-btn {
  color: var(--brand-tertiary, #fbbf24);
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(var(--brand-primary-rgb), 0.05);
}

.line-badge {
  background: var(--brand-primary);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius, 8px);
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(var(--brand-primary-rgb), 0.3);
}

[data-theme='dark'] .line-badge {
  background: var(--brand-tertiary, #fbbf24);
  color: #0d0807;
}
</style>
