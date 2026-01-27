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
    :hint="
      $ngettext(
        'Type to search',
        'Type to search (minimum %{num} characters)',
        MIN_CHARS_SEARCH,
        { num: MIN_CHARS_SEARCH },
      )
    "
    :options="filteredOptions"
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
import { useUiStore } from 'stores/ui'

import { MIN_CHARS_SEARCH } from 'config/app.conf'

export default {
  name: 'FilteredMultiSelect',
  props: {
    modelValue: { type: [Array, Object], default: () => [] },
    label: { type: String, required: true },
    focus: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: true },
    useChips: { type: Boolean, default: false },
    fetchOptions: { type: Function, required: true },
  },
  emits: ['update:modelValue'],
  setup() {
    return { MIN_CHARS_SEARCH }
  },
  data() {
    return {
      filteredOptions: [],
    }
  },
  watch: {
    options(newVal) {
      this.filteredOptions = newVal.slice()
    },
  },
  mounted() {
    if (this.focus && this.$refs.primaryInput) {
      this.$nextTick(() => {
        this.$refs.primaryInput.focus()
      })
    }
  },
  methods: {
    async onFilter(val, update, abort) {
      if (val.length < MIN_CHARS_SEARCH) {
        abort()
        this.filteredOptions = []
        return
      }

      const uiStore = useUiStore()

      try {
        const results = await this.fetchOptions(val)
        this.filteredOptions = results
      } catch (error) {
        uiStore.notifyError(error)
        abort()
      } finally {
        update(() => {})
      }
    },
    onFilterAbort() {
      // console.log('delayed filter aborted')
    },
    updateValue(val) {
      this.$emit('update:modelValue', val)
    },
  },
}
</script>
