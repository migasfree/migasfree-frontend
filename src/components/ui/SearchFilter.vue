<template>
  <div class="row">
    <q-input
      ref="primaryInput"
      v-model="searchText"
      :label="$gettext('Search...')"
      clearable
      :outlined="false"
      @keydown.enter="$emit('search', searchText)"
      @clear="$emit('clear')"
    >
      <template #append>
        <q-btn
          flat
          color="primary"
          :icon="appIcon('search')"
          @click="$emit('search', searchText)"
        />
      </template>
    </q-input>
  </div>
</template>

<script>
import { computed } from 'vue'

import { appIcon } from 'composables/element'

export default {
  name: 'SearchFilter',
  props: {
    modelValue: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['update:model-value', 'search', 'clear'],
  setup(props, { emit }) {
    const searchText = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit('update:model-value', val)
      },
    })

    return {
      searchText,
      appIcon,
    }
  },
}
</script>
