<template>
  <q-dialog v-model="internalModel">
    <q-card class="data-dialog-card">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">
          <q-icon
            :name="appIcon('data')"
            size="lg"
            class="q-mr-sm"
            aria-hidden="true"
          />
          {{ title }}
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-table
          v-for="(serie, index) in dataGrid"
          :key="index"
          class="q-ma-md"
          :title="serie.title"
          :rows="serie.itemData"
          :columns="columns"
          :pagination="{ rowsPerPage: 0 }"
          row-key="name"
          hide-header
          hide-pagination
          @row-click="rowClick"
        >
          <template #top-right>
            <q-btn-dropdown
              flat
              :icon="appIcon('export')"
              color="primary"
              @click.stop
            >
              <q-list>
                <q-item
                  v-close-popup
                  clickable
                  @click="exportTable(serie, 'csv')"
                >
                  <q-item-section>CSV</q-item-section>
                </q-item>
                <q-item
                  v-close-popup
                  clickable
                  @click="exportTable(serie, 'json')"
                >
                  <q-item-section>JSON</q-item-section>
                </q-item>
              </q-list>
              <q-tooltip>{{ $gettext('Export') }}</q-tooltip>
            </q-btn-dropdown>
          </template>
        </q-table>
        <div
          v-if="dataGrid.length === 0"
          class="text-center q-pa-xl opacity-50"
        >
          {{ $gettext('No information') }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat :label="$gettext('Close')" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { appIcon } from 'composables/element'
import { useChartExport } from 'composables/chart/export'

defineOptions({ name: 'PieDataDialog' })

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  dataGrid: { type: Array, required: true },
  columns: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue', 'row-click'])

const { $gettext } = useGettext()
const { exportTableToCsv, exportTableToJson } = useChartExport()

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const rowClick = (_evt, row) => {
  emit('row-click', row)
}

const doExport = (filename, format, items) => {
  if (format === 'csv') {
    exportTableToCsv(`${filename}.csv`, props.columns, items)
  } else {
    exportTableToJson(`${filename}.json`, items)
  }
}

const exportTable = (serie, format) =>
  doExport(serie.title, format, serie.itemData)
</script>
