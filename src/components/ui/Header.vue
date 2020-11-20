<template>
  <div class="row">
    <q-item class="col-12">
      <q-item-section v-if="hasAddButton" avatar>
        <q-btn
          fab-mini
          dark
          color="primary"
          icon="mdi-plus"
          @click="$emit('new')"
        />
      </q-item-section>
      <q-item-section>
        <h2 class="text-h3">
          {{ title }} <q-chip v-if="results !== null">{{ results }}</q-chip>
        </h2>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: { type: String, required: true },
    results: { type: Number, required: false, default: null },
    hasAddButton: { type: Boolean, required: false, default: true }
  }
}
</script>
