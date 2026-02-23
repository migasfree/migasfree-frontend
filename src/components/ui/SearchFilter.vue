<template>
  <div class="row">
    <q-input
      ref="primaryInput"
      v-model="searchText"
      :label="`${$gettext('Search')}...`"
      clearable
      borderless
      dense
      class="search-filter-input"
      @keydown.enter="emit('search', searchText)"
      @clear="emit('clear')"
    >
      <template #prepend>
        <div class="filter-icon-box">
          <q-icon :name="appIcon('search')" size="18px" />
        </div>
      </template>

      <template #append>
        <q-btn
          flat
          round
          dense
          color="primary"
          :icon="appIcon('search')"
          class="action-btn-search opacity-70 hover-opacity-100 cursor-pointer"
          @click="emit('search', searchText)"
        >
          <q-tooltip class="glass-tooltip">{{ $gettext('Search') }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { appIcon } from 'composables/element'

defineOptions({ name: 'SearchFilter' })

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const primaryInput = ref(null)

const searchText = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val || ''),
})

// Expose input controls for parent components
defineExpose({
  focus: () => primaryInput.value?.focus(),
  blur: () => primaryInput.value?.blur(),
})
</script>

<style scoped>
.search-filter-input {
  transition: all 0.3s ease;
}

:deep(.q-field__control) {
  background: rgba(var(--brand-primary-rgb), 0.04);
  border-radius: var(--radius, 12px);
  padding: 0 16px;
  min-height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

/* Focus states */
.search-filter-input:focus-within :deep(.q-field__control) {
  background: white;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px rgba(var(--brand-primary-rgb), 0.1);
}

[data-theme='dark'] .search-filter-input:focus-within :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--brand-tertiary, #fbbf24);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

:deep(.q-field__native) {
  font-weight: 600;
  font-size: 0.95rem;
}

/* Action button animation */
.action-btn-search {
  transition: all 0.3s ease;
}

.action-btn-search:hover {
  transform: scale(1.1);
  background: rgba(var(--brand-primary-rgb), 0.05);
}

[data-theme='dark'] .action-btn-search:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
