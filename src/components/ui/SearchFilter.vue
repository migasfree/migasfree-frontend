<template>
  <div class="row">
    <q-input
      v-model="searchText"
      :label="$gettext('Search...')"
      clearable
      autofocus
      @keydown.enter="$emit('search', searchText)"
      @clear="$emit('clear')"
    >
      <template #append>
        <q-btn
          flat
          color="primary"
          icon="mdi-text-search"
          @click="$emit('search', searchText)"
        />
      </template>
    </q-input>
  </div>
</template>

<script>
import { computed } from 'vue'

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
    }
  },
}
</script>
