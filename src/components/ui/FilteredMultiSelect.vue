<template>
  <q-select
    :model-value="modelValue"
    outlined
    use-input
    :autofocus="autofocus"
    :use-chips="useChips"
    map-options
    :multiple="multiple"
    :counter="multiple"
    :clearable="clearable"
    :label="label"
    :hint="
      $ngettext(
        'Type to search',
        'Type to search (minimum %{num} characters)',
        MIN_CHARS_SEARCH,
        { num: MIN_CHARS_SEARCH },
      )
    "
    :options="options"
    @filter="onFilter"
    @filter-abort="onFilterAbort"
    @update:model-value="updateValue"
  >
    <template #prepend><slot name="prepend"></slot></template>

    <template #no-option>
      <slot name="no-option">
        <q-item>
          <q-item-section class="text-grey">
            {{ $gettext('No results') }}
          </q-item-section>
        </q-item>
      </slot>
    </template>

    <template #option="scope">
      <slot name="option" :scope="scope">
        <q-item v-bind="scope.itemProps">
          {{ scope.opt.label }}
        </q-item>
      </slot>
    </template>

    <template #selected-item="scope">
      <slot name="selected-item" :scope="scope">
        <q-chip
          removable
          dense
          :tabindex="scope.tabindex"
          class="q-ma-md"
          @remove="scope.removeAtIndex(scope.index)"
        >
          {{ scope.opt.label }}
        </q-chip>
      </slot>
    </template>
  </q-select>
</template>

<script>
import { MIN_CHARS_SEARCH } from 'config/app.conf'

export default {
  name: 'FilteredMultiSelect',
  props: {
    modelValue: { type: [Array, Object], default: () => [] },
    options: { type: Array, required: true },
    label: { type: String, required: true },
    autofocus: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: true },
    useChips: { type: Boolean, default: false },
    onFilter: { type: Function, required: true },
    onFilterAbort: { type: Function, required: true },
  },
  emits: ['update:modelValue'],
  methods: {
    updateValue(val) {
      this.$emit('update:modelValue', val)
    },
  },
  setup() {
    return { MIN_CHARS_SEARCH }
  },
}
</script>
