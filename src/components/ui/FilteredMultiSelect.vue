<template>
  <q-select
    ref="primaryInput"
    :model-value="modelValue"
    use-input
    :use-chips="useChips"
    map-options
    :multiple="multiple"
    :counter="multiple"
    :clearable="clearable"
    :label="label"
    :hint="hintText"
    :options="filteredOptions"
    @filter="onFilter"
    @filter-abort="onFilterAbort"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #prepend>
      <slot name="prepend">
        <div class="filter-icon-box">
          <q-icon name="mdi-magnify" size="18px" />
        </div>
      </slot>
    </template>

    <template #no-option>
      <slot name="no-option">
        <q-item>
          <q-item-section class="text-caption text-italic opacity-40">
            {{ $gettext('No results') }}
          </q-item-section>
        </q-item>
      </slot>
    </template>

    <template #option="scope">
      <slot name="option" :scope="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section v-if="scope.opt.icon" avatar>
            <q-icon :name="scope.opt.icon" size="20px" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ scope.opt.label }}
            </q-item-label>
            <q-item-label v-if="scope.opt.description" caption>
              {{ scope.opt.description }}
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="multiple" side>
            <q-checkbox :model-value="scope.selected" dense size="xs" />
          </q-item-section>
        </q-item>
      </slot>
    </template>

    <template #selected-item="scope">
      <slot name="selected-item" :scope="scope">
        <q-chip
          removable
          dense
          outline
          :tabindex="scope.tabindex"
          class="q-ma-xs"
          @remove="scope.removeAtIndex(scope.index)"
        >
          <q-avatar v-if="scope.opt.icon" size="18px" color="transparent">
            <q-icon :name="scope.opt.icon" size="14px" />
          </q-avatar>
          <span class="chip-text">{{ scope.opt.label }}</span>
        </q-chip>
      </slot>
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGettext } from 'vue3-gettext'

import { useUiStore } from 'stores/ui'
import { MIN_CHARS_SEARCH } from 'config/app.conf'

defineOptions({ name: 'FilteredMultiSelect' })

const props = defineProps({
  modelValue: { type: [Array, Object], default: () => [] },
  label: { type: String, required: true },
  focus: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  multiple: { type: Boolean, default: true },
  useChips: { type: Boolean, default: false },
  fetchOptions: { type: Function, required: true },
})

const emit = defineEmits(['update:modelValue'])

const { $ngettext } = useGettext()

const primaryInput = ref(null)
const filteredOptions = ref([])

const hintText = computed(() =>
  $ngettext(
    'Type to search',
    'Type to search (minimum %{num} characters)',
    MIN_CHARS_SEARCH,
    { num: MIN_CHARS_SEARCH },
  ),
)

const uiStore = useUiStore()

const onFilter = async (val, update, abort) => {
  if (val.length < MIN_CHARS_SEARCH) {
    abort()
    filteredOptions.value = []
    return
  }

  try {
    filteredOptions.value = await props.fetchOptions(val)
  } catch (error) {
    uiStore.notifyError(error)
    abort()
  } finally {
    update(() => {})
  }
}

const onFilterAbort = () => {}

onMounted(() => {
  if (props.focus && primaryInput.value) {
    nextTick(() => primaryInput.value.focus())
  }
})
</script>

<style scoped>
.chip-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
