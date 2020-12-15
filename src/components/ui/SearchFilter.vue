<template>
  <div class="row q-pa-md">
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
export default {
  name: 'SearchFilter',
  props: {
    value: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      searchText: this.value
    }
  },
  watch: {
    value(val) {
      this.searchText = val
    }
  }
}
</script>
