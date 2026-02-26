<template>
  <div class="select-attributes-container">
    <FilteredMultiSelect
      v-model="localValue"
      clearable
      :label="label"
      :fetch-options="filterAttributes"
      class="attributes-select"
    >
      <template #option="{ scope }">
        <q-item v-bind="scope.itemProps" class="attribute-option">
          <q-item-section avatar>
            <q-icon
              :name="elementIcon(scope.opt.status)"
              size="sm"
              color="primary"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ attributeValue(scope.opt) }}
            </q-item-label>
            <q-item-label v-if="scope.opt.summary" caption>
              {{ scope.opt.summary }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template #selected-item="{ scope }">
        <q-chip
          removable
          dense
          color="transparent"
          :tabindex="scope.tabindex"
          class="q-ma-sm q-pa-none"
          @remove="scope.removeAtIndex(scope.index)"
        >
          <MigasLink
            :model="equivalentModel(scope.opt)"
            :pk="equivalentKey(scope.opt)"
            :value="attributeValue(scope.opt)"
            :icon="elementIcon(scope.opt.status)"
            :tooltip="scope.opt.summary"
          />
        </q-chip>
      </template>
    </FilteredMultiSelect>

    <div v-if="hasPaste" class="copy-paste-actions row q-mt-sm justify-end">
      <MicroInteractionButton
        :icon="appIcon('copy')"
        :success-icon="appIcon('yes')"
        :tooltip="$gettext('Copy')"
        :success-tooltip="$gettext('Copied!')"
        :action="handleCopyList"
      />

      <MicroInteractionButton
        :icon="appIcon('paste')"
        :success-icon="appIcon('yes')"
        :tooltip="$gettext('Paste')"
        :success-tooltip="$gettext('Pasted!')"
        :action="handlePasteList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from 'boot/axios'

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'
import MicroInteractionButton from 'components/ui/MicroInteractionButton.vue'

import useCopyPaste from 'composables/copyPaste'
import { appIcon, useElement } from 'composables/element'

defineOptions({ name: 'SelectAttributes' })

const props = defineProps({
  modelValue: { type: Array, required: true },
  label: { type: String, required: true },
})

const emit = defineEmits(['update:model-value'])

const { copyList, pasteList, hasPaste } = useCopyPaste()
const { elementIcon, equivalentModel, equivalentKey, attributeValue } =
  useElement()

const ENDPOINT = '/api/v1/token/attributes'
const ENRICHABLE_PREFIXES = new Set(['CID', 'SET', 'DMN'])

const localValue = ref(props.modelValue)

// --- Data fetching ---

const filterAttributes = async (val) => {
  const { data } = await api.get(`${ENDPOINT}/`, {
    params: { search: val.toLowerCase() },
  })
  return data.results
}

const enrichAttribute = async (attr) => {
  if (attr.status && attr.summary) return attr

  const prefix = attr.property_att?.prefix
  if (ENRICHABLE_PREFIXES.has(prefix)) {
    const { data } = await api.get(`${ENDPOINT}/${attr.id}/badge/`)
    return { ...attr, ...data, description: data.text }
  }

  if (attr.property_att?.sort === 'server') {
    return { ...attr, status: 'tag' }
  }

  return attr
}

const updateAttributes = async () => {
  const enriched = await Promise.all(localValue.value.map(enrichAttribute))
  localValue.value = enriched
  emit('update:model-value', [...enriched])
}

// --- Copy/Paste ---

const handleCopyList = () => copyList('attributes', localValue.value)

const handlePasteList = async () => {
  await pasteList((item) => {
    if (!localValue.value.some((a) => a.id === item.id)) {
      localValue.value.push(item)
    }
  })
  await updateAttributes()
}

// --- Watchers ---

watch(
  () => props.modelValue,
  async (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      localValue.value = [...newVal]
      await updateAttributes()
    }
  },
  { immediate: true },
)

watch(localValue, (val) => {
  emit('update:model-value', val ?? [])
})

onMounted(updateAttributes)
</script>

<style scoped>
.select-attributes-container {
  width: 100%;
}

:deep(.q-field__control) {
  border-radius: var(--radius, 14px);
  background: rgba(var(--brand-primary-rgb), 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme='dark'] :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .attribute-chip {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.attribute-option {
  border-radius: var(--radius, 8px);
  margin: 2px 8px;
  transition: background 0.2s ease;
}
</style>
