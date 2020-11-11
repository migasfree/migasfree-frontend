<template>
  <div class="row">
    <q-btn v-if="hasAddButton" fab-mini dark color="primary" icon="mdi-plus" />
    <h2 class="text-h3">
      {{ title }} <q-chip>{{ results }}</q-chip>
    </h2>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    results: { type: Number, required: false, default: 0 },
    hasAddButton: { type: Boolean, required: false, default: true }
  },
  computed: {
    titleCols() {
      return this.hasAddButton ? 11 : 12
    }
  }
}
</script>
