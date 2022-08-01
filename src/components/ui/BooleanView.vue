<template>
  <q-icon v-if="value" name="mdi-check-bold" color="positive" size="md"
    ><q-tooltip><translate>Yes</translate></q-tooltip></q-icon
  >
  <q-icon v-else name="mdi-close-thick" color="negative" size="md">
    <q-tooltip><translate>No</translate></q-tooltip>
  </q-icon>
</template>

<script>
export default {
  name: 'BooleanView',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
}
</script>
