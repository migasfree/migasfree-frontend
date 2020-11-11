<template>
  <div class="row q-pa-md">
    <q-input
      v-model="searchText"
      label="Buscar..."
      clearable
      autofocus
      @keydown.enter="$emit('search', searchText)"
      @clear="$emit('clear')"
    >
      <template v-slot:append>
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
  data() {
    return {
      searchText: ''
    }
  }
}
</script>
