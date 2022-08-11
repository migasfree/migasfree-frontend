<template>
  <div class="row">
    <q-item class="col-12 items-baseline">
      <template v-if="addRoutes.length > 0">
        <q-item-section v-for="(item, index) in addRoutes" :key="index" avatar>
          <q-btn
            round
            dark
            color="primary"
            icon="mdi-plus"
            @click="$router.push({ name: item.route })"
          >
            <q-tooltip>{{
              item.title ? item.title : $gettext('Add')
            }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </template>

      <q-item-section>
        <h2 class="text-h4">
          {{ title }}
          <q-chip v-if="results !== null" size="lg" color="info">{{
            results
          }}</q-chip>
          <q-btn
            v-if="hasExportButton"
            class="q-ma-sm float-right"
            color="info"
            text-color="black"
            :label="$gettext('Export')"
            icon="mdi-file-export"
            :loading="isLoadingExport"
            :disable="results === 0"
            @click="$emit('exportAll')"
          />
          <slot name="append"></slot>
        </h2>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Header',

  props: {
    title: { type: String, required: true },
    results: { type: Number, required: false, default: null },
    addRoutes: {
      type: Array,
      required: false,
      default() {
        return []
      },
    },
    hasExportButton: { type: Boolean, required: false, default: true },
    isLoadingExport: { type: Boolean, required: false, default: false },
  },

  emits: ['exportAll'],
})
</script>
