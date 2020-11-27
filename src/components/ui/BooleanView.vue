<template>
  <div>
    <q-icon v-if="value" name="mdi-check-bold" color="positive" size="md"
      ><q-tooltip>Sí</q-tooltip></q-icon
    >
    <q-icon v-else name="mdi-close-thick" color="negative" size="md">
      <q-tooltip>No</q-tooltip>
    </q-icon>
  </div>
</template>

<script>
export default {
  name: 'BooleanView',
  props: {
    value: {
      type: Boolean,
      required: true
    }
  }
}
</script>
