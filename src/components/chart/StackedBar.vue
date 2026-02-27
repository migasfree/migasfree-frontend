<template>
  <div class="chart-container">
    <div class="panel glass-panel overflow-hidden">
      <!-- Header -->
      <div
        v-if="title && showTitle"
        class="panel-header q-px-lg q-py-md row items-center justify-between no-wrap"
      >
        <div class="title-group row items-center no-wrap col-grow">
          <h2 class="panel-title ellipsis q-ma-none" :title="title">
            {{ title }}
          </h2>
        </div>

        <div
          class="actions-group row items-center no-wrap q-gutter-x-xs q-ml-sm"
        >
          <!-- Selection Mode Toggle -->
          <q-btn-toggle
            v-if="isSelectedModeVisible"
            v-model="selectedMode"
            flat
            dense
            toggle-color="brand-primary"
            class="selection-toggle q-mr-sm"
            :options="[
              { value: 'multiple', slot: 'multiple' },
              { value: 'single', slot: 'single' },
            ]"
            @update:model-value="updateSelectedMode"
          >
            <template #multiple>
              <q-icon name="mdi-image-multiple" size="18px" />
              <q-tooltip>{{ $gettext('Multiple Selection') }}</q-tooltip>
            </template>
            <template #single>
              <q-icon name="mdi-image" size="18px" />
              <q-tooltip>{{ $gettext('Single Selection') }}</q-tooltip>
            </template>
          </q-btn-toggle>

          <!-- Data View Button -->
          <q-btn
            v-show="isChartVisible"
            flat
            dense
            size="sm"
            color="grey-7"
            :icon="appIcon('data')"
            class="action-btn q-pa-xs rounded-borders"
            @click="dataView"
          >
            <q-tooltip>{{ $gettext('Data View') }}</q-tooltip>
          </q-btn>

          <!-- Export Dropdown -->
          <ExportMenu
            v-show="isChartVisible"
            @save-svg="saveSvg"
            @save-png="savePng"
            @export-data="exportTable"
          />
        </div>
      </div>

      <slot name="selector"></slot>

      <!-- Date Selectors -->
      <div
        v-if="monthSelector || daySelector"
        class="row justify-center items-center q-pa-sm q-gutter-sm"
      >
        <MonthInput
          v-if="monthSelector"
          v-model="begin"
          outlined
          dense
          hide-bottom-space
          :label="$gettext('Initial Month')"
        />

        <MonthInput
          v-if="monthSelector"
          v-model="end"
          outlined
          dense
          hide-bottom-space
          :label="$gettext('Final Month')"
        />

        <DayInput
          v-if="daySelector"
          v-model="begin"
          outlined
          dense
          hide-bottom-space
          :label="$gettext('Initial Day')"
        />

        <DayInput
          v-if="daySelector"
          v-model="end"
          outlined
          dense
          hide-bottom-space
          :label="$gettext('Final Day')"
        />

        <q-btn
          color="primary"
          class="update-btn"
          :icon="appIcon('update')"
          :disabled="loading"
          :loading="loading"
          :label="$gettext('Update')"
          @click="loadData"
        />
      </div>

      <!-- Chart Area -->
      <div class="chart-wrapper q-px-md q-pb-md">
        <v-chart
          v-show="isChartVisible"
          ref="chart"
          class="echarts"
          :init-options="initOptions"
          :option="options"
          :loading="loading"
          :loading-options="loadingOptions"
          autoresize
          @click="passData"
        />

        <!-- No data fallback -->
        <div v-if="noData && !loading" class="text-center q-pa-xl opacity-50">
          <q-icon name="mdi-chart-bar" size="xl" class="q-mb-sm" />
          <div class="text-subtitle1">
            {{ $gettext('No data available.') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Data Dialog -->
    <q-dialog v-model="viewData">
      <q-card class="data-dialog-card">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            <q-icon :name="appIcon('data')" size="lg" class="q-mr-sm" />
            {{ title }}
          </div>
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-table
            v-if="isChartVisible"
            class="q-ma-md"
            :pagination="{ rowsPerPage: 0 }"
            :rows="data.series"
            hide-pagination
            flat
            bordered
          >
            <template #top-left>
              <q-btn-dropdown
                flat
                :icon="appIcon('export')"
                color="primary"
                @click.stop
              >
                <q-list>
                  <q-item v-close-popup clickable @click="exportTable('csv')">
                    <q-item-section>CSV</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="exportTable('json')">
                    <q-item-section>JSON</q-item-section>
                  </q-item>
                </q-list>
                <q-tooltip>{{ $gettext('Export') }}</q-tooltip>
              </q-btn-dropdown>
            </template>

            <template #header>
              <q-tr>
                <q-th></q-th>
                <q-th v-for="(item, index) in data.xData" :key="index">
                  {{ item }}
                </q-th>
              </q-tr>
            </template>

            <template #body="slotProps">
              <q-tr :props="slotProps">
                <q-th>{{ slotProps.row.name }}</q-th>
                <q-td
                  v-for="(item, index) in slotProps.row.data"
                  :key="index"
                  class="cursor-pointer"
                  @click="selectCell(item)"
                >
                  {{ item.value }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="$gettext('Close')"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { exportFile, useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import VChart from 'vue-echarts'

import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { appIcon } from 'composables/element'
import { useChartExport } from 'composables/chart/export'
import { useChartOptions } from 'composables/chart/options'
import { useChartUtils } from 'composables/chart/utils'

import DayInput from 'components/ui/DayInput'
import MonthInput from 'components/ui/MonthInput'
import ExportMenu from 'components/chart/ExportMenu'

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
  SVGRenderer,
])

defineOptions({ name: 'StackedBarChart' })

const props = defineProps({
  title: { type: String, required: true },
  showTitle: { type: Boolean, default: true },
  endPoint: { type: String, default: '' },
  initialData: { type: Object, default: () => ({}) },
  monthSelector: { type: Boolean, default: false },
  daySelector: { type: Boolean, default: false },
})

const emit = defineEmits(['get-link'])

const $q = useQuasar()
const { $gettext } = useGettext()
const uiStore = useUiStore()

const chart = ref(null)
const data = reactive(props.initialData)
const begin = ref('')
const end = ref('')
const selectedMode = ref('multiple')
const loading = ref(false)
const viewData = ref(false)

const { initOptions, loadingOptions, getChartColors, getTextColor } =
  useChartOptions()
useChartUtils(chart)
const { saveSvgImage, savePngImage, wrapCsvValue, exportTableToJson } =
  useChartExport()

// --- Dark-mode aware helpers ---

const isDark = computed(() => $q.dark.isActive)
const textColor = computed(() =>
  isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
)
const splitLineColor = computed(() =>
  isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
)

const tooltipStyle = computed(() => ({
  backgroundColor: isDark.value
    ? 'rgba(26, 18, 16, 0.95)'
    : 'rgba(255, 255, 255, 0.95)',
  borderColor: isDark.value ? '#431407' : '#e5e7eb',
  textStyle: {
    color: isDark.value ? '#fefce8' : '#1f2937',
    fontFamily: 'Dosis',
  },
  axisPointer: {
    type: 'shadow',
    shadowStyle: {
      color: isDark.value ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    },
  },
}))

// --- Chart options ---

const options = reactive({
  animation: false,
  backgroundColor: 'transparent',
  color: getChartColors(),
  textStyle: { fontFamily: 'Dosis', fontSize: 14 },
  tooltip: {
    show: true,
    trigger: 'axis',
    appendToBody: true,
    ...tooltipStyle.value,
  },
  legend: {
    type: 'scroll',
    show: true,
    bottom: 'bottom',
    textStyle: { color: textColor.value, fontFamily: 'Dosis' },
    pageTextStyle: { color: textColor.value },
    pageIconColor: isDark.value ? '#fff' : '#2f4554',
    itemGap: 20,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    top: '5%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: textColor.value,
      fontFamily: 'Dosis',
      margin: 15,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: { color: splitLineColor.value, type: 'dashed' },
    },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: textColor.value, fontFamily: 'Dosis' },
  },
  series: [],
  title: { text: props.title, show: false },
})

// --- Computed ---

const isChartVisible = computed(
  () => 'series' in data && data.series.length > 0,
)

const isSelectedModeVisible = computed(
  () => isChartVisible.value && options.series.length > 1,
)

const noData = computed(() => !isChartVisible.value)

// --- Data sync helper ---

const syncDataToOptions = () => {
  if ('series' in data) options.series = data.series
  if ('xData' in data) options.xAxis.data = data.xData
}

// --- Actions ---

const passData = (params) => emit('get-link', params)

const selectCell = (cellData) => passData({ data: cellData })

const updateSelectedMode = () => {
  options.legend.selectedMode = selectedMode.value
}

const dataView = () => {
  viewData.value = true
}

const saveSvg = () => saveSvgImage(chart.value, props.title)
const savePng = () => savePngImage(chart.value, props.title)

// --- Data loading ---

const loadData = async () => {
  if (!props.endPoint) return

  loading.value = true
  try {
    const { data: resp } = await api.get(props.endPoint, {
      params: { begin: begin.value, end: end.value },
    })

    const series = Object.entries(resp.data).map(([name, values]) => ({
      type: 'line',
      smooth: true,
      name,
      data: values,
    }))

    Object.assign(data, { xData: resp.x_labels, series })
    syncDataToOptions()
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

// --- Export ---

const exportTable = (format) => {
  const filename = `${props.title}.${format}`

  if (format === 'csv') {
    const head = ['', ...data.xData.map(wrapCsvValue)].join(',')
    const body = data.series
      .map((row) =>
        [
          wrapCsvValue(row.name),
          ...row.data.map((item) => wrapCsvValue(item.value)),
        ].join(','),
      )
      .join('\r\n')

    const status = exportFile(filename, [head, body].join('\r\n'), 'text/csv')
    if (status !== true) {
      uiStore.notifyError($gettext('Browser denied file download...'))
    }
  } else {
    exportTableToJson(filename, data)
  }
}

// --- Lifecycle ---

onMounted(loadData)

// --- Watchers ---

watch(
  () => props.initialData,
  (val) => {
    Object.assign(data, val)
    syncDataToOptions()
  },
  { deep: true, immediate: true },
)

watch(isDark, (val) => {
  options.color = getChartColors()
  Object.assign(options.tooltip, tooltipStyle.value)

  const tc = val ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
  const sc = val ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'

  // Legend
  options.legend.textStyle.color = tc
  options.legend.pageTextStyle.color = tc
  options.legend.pageIconColor = val ? '#fff' : '#2f4554'

  // Axes
  options.xAxis.axisLabel.color = tc
  options.yAxis.axisLabel.color = tc
  options.yAxis.splitLine.lineStyle.color = sc

  // MarkLine (if present)
  if (options.series?.[0]?.markLine) {
    options.series[0].markLine.label.color = getTextColor()
  }
})
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  position: relative;
}

.echarts {
  width: 100%;
  height: 100%;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--brand-primary);
  border-bottom: none;
}

.selection-toggle {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 2px;
}

[data-theme='dark'] .selection-toggle {
  background: rgba(255, 255, 255, 0.05);
}

.data-dialog-card {
  min-width: 500px;
}

.update-btn {
  height: 40px;
}
</style>
