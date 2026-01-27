<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    option-value="id"
    option-label="name"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #before>
      <q-icon :name="appIcon('filter')" />
    </template>
  </q-select>
</template>

<script>
import { appIcon } from 'composables/element'

export default {
  name: 'FilterSelect',

  props: {
    modelValue: {
      type: [Object, String, Number],
      default: null,
    },
    options: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },

  emits: ['update:modelValue'],

  setup() {
    return {
      appIcon,
    }
  },
}
</script>
