<template>
  <q-btn-dropdown color="primary" outline split no-caps push dense :to="link">
    <template v-slot:label>
      <q-icon v-if="icon" left :name="icon" />
      {{ value }}
      <q-tooltip v-if="tooltip" content-style="font-size: 14px">
        {{ tooltip }}
      </q-tooltip>
    </template>
  </q-btn-dropdown>
</template>

<script>
export default {
  props: {
    model: { type: String, required: true },
    pk: { type: Number, required: true },
    value: { type: String, required: true },
    tooltip: { type: String, required: false, default: '' },
    icon: { type: String, required: false, default: '' }
  },
  computed: {
    link() {
      return `/${this.model}/results/${this.pk}`
    }
  }
}
</script>
