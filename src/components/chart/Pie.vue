<template>
  <div class="pie-chart-wrapper panel column">
    <!-- Header Section -->
    <div class="panel-header row items-center justify-between no-wrap q-mb-md">
      <!-- Left side: Title + Total Badge -->
      <div class="title-group row items-center no-wrap col-grow">
        <h2 class="panel-title ellipsis" :title="title">
          {{ title }}
        </h2>
        <q-btn
          v-if="data.total > 0"
          unelevated
          dense
          no-caps
          class="total-badge q-ml-sm"
          :color="critical && data.total > 0 ? 'negative' : 'warning-surface'"
          :text-color="critical && data.total > 0 ? 'white' : 'brand-primary'"
          @click="goTo"
        >
          <span class="text-weight-bolder">{{ data.total }}</span>
          <q-tooltip>{{ $gettext('View All') }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Right side: Actions -->
      <div
        v-show="isChartVisible"
        class="actions-group row items-center no-wrap q-gutter-x-xs"
      >
        <q-btn
          flat
          dense
          size="sm"
          class="q-pa-xs rounded-borders"
          color="grey-7"
          :icon="appIcon('data')"
          @click="dataView"
        >
          <q-tooltip>{{ $gettext('Data View') }}</q-tooltip>
        </q-btn>
        <ExportMenu
          @save-svg="saveSvg"
          @save-png="savePng"
          @export-data="exportData"
        />
      </div>
    </div>

    <!-- Content Section: Responsive Layout -->
    <div class="content-row row col">
      <!-- Chart Area -->
      <div class="col-12 col-md-7 chart-area relative-position">
        <div class="chart-container-inner">
          <v-chart
            v-show="isChartVisible"
            ref="chart"
            class="chart"
            :init-options="initOptions"
            :option="options"
            :loading="loading"
            :loading-options="loadingOptions"
            autoresize
            @click="passData"
            @mouseover="onChartHover"
            @focusin="onChartHover"
            @mouseout="hoverIndex = -1"
            @focusout="hoverIndex = -1"
          />
        </div>

        <!-- No data fallback inside chart area -->
        <div
          v-if="noData && !loading"
          class="text-center q-pa-xl opacity-50 absolute-center"
        >
          <q-icon name="mdi-chart-arc" size="xl" class="q-mb-sm" />
          <div class="text-subtitle1">
            {{ $gettext('No data available.') }}
          </div>
        </div>
      </div>

      <!-- Custom Legend / Interactive List -->
      <div
        class="col-12 col-md-5 q-pl-md-md q-pt-sm q-pt-md-none chart-scroll-area display-flex"
      >
        <q-scroll-area class="legend-scroll">
          <q-list
            separator
            :dense="flatData.length > 8"
            class="rounded-borders"
          >
            <template v-for="(group, gIndex) in flatData" :key="'g' + gIndex">
              <!-- Parent Item (Inner Ring) -->
              <q-item
                v-ripple
                clickable
                class="legend-item q-py-sm"
                :class="{
                  'bg-blue-grey-1':
                    hoverIndex === group.index &&
                    hoverSeries === 0 &&
                    !$q.dark.isActive,
                  'bg-grey-9':
                    hoverIndex === group.index &&
                    hoverSeries === 0 &&
                    $q.dark.isActive,
                }"
                @mouseenter="highlightChart(group.index, 0)"
                @focus="highlightChart(group.index, 0)"
                @mouseleave="downplayChart(0)"
                @blur="downplayChart(0)"
                @click="passData({ data: group })"
              >
                <q-item-section avatar class="legend-item-section">
                  <div
                    class="color-dot shadow-1"
                    :style="{ backgroundColor: group.color }"
                  ></div>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ group.name }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-weight-bold">{{ group.value }}</span>
                    <q-badge
                      v-if="data.total > 0"
                      color="grey-3"
                      text-color="grey-9"
                    >
                      {{ getPercentage(group.value) }}%
                    </q-badge>
                  </div>
                </q-item-section>
              </q-item>

              <!-- Child Items (Outer Ring / Subdata) -->
              <q-item
                v-for="(child, cIndex) in group.children"
                :key="'c' + cIndex"
                v-ripple
                clickable
                dense
                class="legend-child-item q-ml-lg q-py-xs"
                :class="{
                  'bg-blue-grey-1':
                    hoverIndex === child.index &&
                    hoverSeries === 1 &&
                    !$q.dark.isActive,
                  'bg-grey-9':
                    hoverIndex === child.index &&
                    hoverSeries === 1 &&
                    $q.dark.isActive,
                }"
                @mouseenter="highlightChart(child.index, 1)"
                @focus="highlightChart(child.index, 1)"
                @mouseleave="downplayChart(1)"
                @blur="downplayChart(1)"
                @click="passData({ data: child })"
              >
                <q-item-section avatar class="legend-item-section">
                  <div
                    class="color-dot-child"
                    :style="{ backgroundColor: getOuterColor(child.index) }"
                  ></div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption text-weight-medium">
                    {{ child.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-caption text-weight-bold">{{
                      child.value
                    }}</span>
                    <q-badge
                      v-if="data.total > 0"
                      color="grey-2"
                      text-color="grey-7"
                    >
                      {{ getPercentage(child.value) }}%
                    </q-badge>
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </div>
    </div>

    <!-- Data Table Dialog -->
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
            v-if="options.series.length === 0"
            class="text-center q-pa-xl opacity-50"
          >
            {{ $gettext('No information') }}
          </div>
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
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  shallowRef,
  shallowReactive,
  getCurrentInstance,
} from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import VChart from 'vue-echarts'

import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { appIcon } from 'composables/element'
import { useChartExport } from 'composables/chart/export'
import { useChartOptions } from 'composables/chart/options'
import { useChartUtils } from 'composables/chart/utils'

import ExportMenu from 'components/chart/ExportMenu'

echarts.use([
  PieChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  SVGRenderer,
])

defineOptions({ name: 'PieChart' })

const props = defineProps({
  title: { type: String, required: true },
  endPoint: { type: String, required: true },
  url: { type: Object, default: () => ({}) },
  critical: { type: Boolean, default: false },
})

const emit = defineEmits(['get-link'])

const $q = useQuasar()
const router = useRouter()
const { $gettext } = useGettext()
const uiStore = useUiStore()
const instance = getCurrentInstance()

const chart = ref(null)
const data = reactive({})
const hoverIndex = ref(-1)
const hoverSeries = ref(-1)
const loading = ref(false)
const viewData = ref(false)
const dataGrid = shallowRef([])
const currentGroupByKey = ref(null)

const { initOptions, loadingOptions, getChartColors, getTextColor } =
  useChartOptions()
const { groupBy } = useChartUtils(chart)
const { saveSvgImage, savePngImage, exportTableToCsv, exportTableToJson } =
  useChartExport()

// --- Dark-mode aware helpers ---

const isDark = computed(() => $q.dark.isActive)
const borderColor = computed(() => (isDark.value ? '#1a1210' : '#fff'))

const tooltipStyle = computed(() => ({
  backgroundColor: isDark.value
    ? 'rgba(26, 18, 16, 0.95)'
    : 'rgba(255, 255, 255, 0.95)',
  borderColor: isDark.value ? '#431407' : '#e5e7eb',
  textStyle: { color: isDark.value ? '#fefce8' : '#1f2937' },
}))

// --- Chart options ---

const columns = [
  { name: 'name', field: 'name', label: $gettext('Name'), align: 'left' },
  { name: 'value', field: 'value', label: $gettext('Value') },
]

const buildNormalSeries = () => [
  {
    type: 'pie',
    radius: ['60%', '85%'],
    center: ['50%', '50%'],
    data: [],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 5,
      borderColor: borderColor.value,
      borderWidth: 2,
    },
    emphasis: {
      scale: true,
      scaleSize: 10,
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    label: { show: false },
  },
]

const buildNestedSeries = () => [
  {
    type: 'pie',
    selectedMode: 'single',
    radius: ['30%', '45%'],
    center: ['50%', '50%'],
    label: {
      position: 'inner',
      fontSize: 10,
      color: isDark.value ? 'black' : 'white',
      textBorderColor: isDark.value ? 'white' : 'black',
      textBorderWidth: 1,
      show: false,
    },
    labelLine: { show: false },
    labelLayout: { hideOverlap: true },
    itemStyle: {
      borderRadius: 2,
      borderColor: borderColor.value,
      borderWidth: 1,
    },
    data: [],
  },
  {
    type: 'pie',
    radius: ['50%', '75%'],
    center: ['50%', '50%'],
    label: { show: false },
    labelLayout: { hideOverlap: true },
    itemStyle: {
      borderRadius: 4,
      borderColor: borderColor.value,
      borderWidth: 2,
    },
    data: [],
  },
]

const options = shallowReactive({
  animation: false,
  textStyle: { fontFamily: 'Dosis', fontSize: 14 },
  tooltip: {
    trigger: 'item',
    appendToBody: true,
    formatter: '{b} ({c}): <strong>{d}%</strong>',
    ...tooltipStyle.value,
  },
  color: getChartColors(),
  series: [],
  title: { text: props.title, show: false },
  legend: { show: false },
})

// --- Computed ---

const isNested = computed(() => 'inner' in data)

const isChartVisible = computed(
  () => Object.keys(data).length === 0 || data.total > 0,
)

const noData = computed(() => !('total' in data) || data.total === 0)

const getPercentage = (value) => {
  if (!data.total || data.total === 0) return '0.0'
  return ((value / data.total) * 100).toFixed(1)
}

const flatData = computed(() => {
  const palette = getChartColors()
  if (!isNested.value) {
    if (!data.data) return []
    return data.data.map((item, i) => ({
      ...item,
      color: palette[i % palette.length],
      index: i,
    }))
  }

  if (!data.outer || !data.inner || !currentGroupByKey.value) return []

  // Use pre-indexed and pre-grouped data for better performance
  const indexedOuter = data.outer.map((item, index) => ({ ...item, index }))
  const groupedOuter = groupBy(indexedOuter, currentGroupByKey.value)

  return data.inner.map((innerItem, i) => {
    const parentKey = innerItem[currentGroupByKey.value]
    let children = []

    if (currentGroupByKey.value === 'status_in') {
      if (typeof parentKey === 'string' && parentKey.includes(',')) {
        parentKey.split(',').forEach((key) => {
          if (groupedOuter[key]) children.push(...groupedOuter[key])
        })
      } else {
        children = groupedOuter[parentKey] || []
      }
    } else {
      children = groupedOuter[parentKey] || []
    }

    return {
      ...innerItem,
      color: palette[i % palette.length],
      index: i,
      children,
    }
  })
})

const getOuterColor = (index) => {
  const palette = getChartColors()
  const offset = data.inner?.length || 0
  return palette[(offset + index) % palette.length]
}

// --- Interactivity: legend <-> chart ---

const targetSeriesIndex = computed(() => (isNested.value ? 1 : 0))

const highlightChart = (index, sIndex = null) => {
  const seriesIndex = sIndex !== null ? sIndex : targetSeriesIndex.value
  hoverIndex.value = index
  hoverSeries.value = seriesIndex

  if (!chart.value) return
  chart.value.dispatchAction({
    type: 'highlight',
    seriesIndex,
    dataIndex: index,
  })
  chart.value.dispatchAction({
    type: 'showTip',
    seriesIndex,
    dataIndex: index,
  })
}

const downplayChart = (sIndex = null) => {
  const seriesIndex = sIndex !== null ? sIndex : targetSeriesIndex.value
  hoverIndex.value = -1
  hoverSeries.value = -1

  if (!chart.value) return
  chart.value.dispatchAction({
    type: 'downplay',
    seriesIndex,
  })
  chart.value.dispatchAction({ type: 'hideTip' })
}

const onChartHover = (params) => {
  if (params.dataIndex !== undefined) {
    hoverIndex.value = params.dataIndex
    hoverSeries.value = params.seriesIndex
  }
}

// --- Navigation & data ---

const passData = (params) => {
  emit('get-link', { ...params, url: props.url })
}

const rowClick = (_evt, row) => {
  passData({ data: row })
}

const goTo = () => {
  if (props.url && Object.keys(props.url).length > 0) {
    const currentRouter = router || instance?.proxy?.$router
    if (currentRouter) {
      currentRouter.push(props.url)
    }
  }
}

// --- Data View ---

const dataView = () => {
  viewData.value = true

  if (options.series.length === 2) {
    const keys = Object.keys(options.series[0].data[0])
    const groupByKey = keys.filter((x) => !['name', 'value'].includes(x))
    const groupByData = groupBy(options.series[1].data, groupByKey)

    dataGrid.value = options.series[0].data.map((item) => {
      let itemData = []
      if (groupByKey[0] !== 'status_in') {
        itemData = groupByData[item[groupByKey]]
      } else if (item[groupByKey].includes(',')) {
        item[groupByKey].split(',').forEach((key) => {
          if (groupByData[key]) itemData.push(groupByData[key][0])
        })
        if (itemData.length === 0) itemData = groupByData[item[groupByKey]]
      } else {
        itemData = groupByData[item[groupByKey]]
      }
      return { title: `${item.name} (${item.value})`, itemData }
    })
  } else {
    dataGrid.value = [
      { title: `${data.title} (${data.total})`, itemData: data.data },
    ]
  }
}

// --- Export ---

const doExport = (filename, format, items) => {
  if (format === 'csv') {
    exportTableToCsv(`${filename}.csv`, columns, items)
  } else {
    exportTableToJson(`${filename}.json`, items)
  }
}

const exportTable = (serie, format) =>
  doExport(serie.title, format, serie.itemData)
const exportData = (format) => doExport(props.title, format, flatData.value)

const saveSvg = () => saveSvgImage(chart.value, props.title)
const savePng = () => savePngImage(chart.value, props.title)

// --- Lifecycle ---

onMounted(async () => {
  loading.value = true
  try {
    const { data: response } = await api.get(props.endPoint)
    const nested = 'inner' in response

    if (nested && response.inner.length > 0) {
      const keys = Object.keys(response.inner[0] || {})
      currentGroupByKey.value = keys.find((x) => !['name', 'value'].includes(x))
    }

    options.series = nested ? buildNestedSeries() : buildNormalSeries()
    Object.assign(data, response)

    if (nested) {
      options.series[0].data = data.inner
      options.series[1].data = data.outer
    } else {
      options.series[0].data = data.data
    }
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
})

// --- Dark mode watcher ---

watch(isDark, (val) => {
  options.color = getChartColors()
  Object.assign(options.tooltip, tooltipStyle.value)

  for (const serie of options.series) {
    if (serie.itemStyle) {
      serie.itemStyle.borderColor = val ? '#1a1210' : '#fff'
    }
    if (serie.label?.position === 'inner') {
      serie.label.color = val ? 'black' : 'white'
      serie.label.textBorderColor = val ? 'white' : 'black'
    } else if (serie.label) {
      serie.label.color = getTextColor()
    }
  }
})
</script>

<style scoped>
.pie-chart-wrapper {
  container-type: inline-size;
  container-name: pie-chart;
  width: 100%;
  padding: 1.25rem 1.5rem;
}

.chart-area {
  min-height: 300px;
  height: 300px;
}

.chart-container-inner {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.color-dot-child {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  opacity: 0.5;
  margin-left: 4px;
}

.legend-item {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.legend-child-item {
  border-radius: 6px;
  min-height: 32px;
  opacity: 0.8;
  transition: all 0.2s;
  border-left: 2px solid transparent;
}

.legend-child-item:hover {
  opacity: 1;
  background: rgba(var(--brand-primary-rgb), 0.04);
  border-left-color: var(--brand-primary);
}

[data-theme='dark'] .legend-child-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: var(--brand-tertiary);
}

.legend-item-section {
  min-width: 24px;
  padding-right: 8px;
}

.data-dialog-card {
  min-width: 500px;
}

.legend-scroll {
  height: 300px;
  width: 100%;
}

.total-badge {
  border-radius: 8px;
  min-width: 32px;
  min-height: 0;
  padding: 2px 8px;
  font-size: 0.85rem;
  line-height: 1;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.total-badge:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  filter: brightness(0.95);
}

/*
   --- SMART RESPONSIVE (Container Queries) ---
   Adapts to host container width, not just browser viewport.
*/
@container pie-chart (max-width: 600px) {
  .content-row {
    flex-direction: column !important;
    flex-wrap: nowrap !important;
  }

  .header-row {
    flex-wrap: nowrap !important;
    margin-bottom: 12px !important;
  }

  .title-group {
    flex: 1 1 auto;
    min-width: 0;
  }

  .actions-group {
    flex: 0 0 auto;
    padding-top: 0;
  }

  .header-row .text-h6 {
    font-size: 1rem;
  }

  .total-badge {
    font-size: 0.85rem;
  }

  .chart-area {
    width: 100%;
    max-width: 100%;
    min-height: 200px;
    max-height: 240px;
    flex: 0 0 auto;
  }

  .chart-scroll-area {
    width: 100%;
    max-width: 100%;
    padding-left: 0 !important;
    padding-top: 12px !important;
    flex: 1 1 auto;
  }

  .legend-scroll {
    height: 180px !important;
  }
}

/* Fallback responsive for older browsers */
@media (max-width: 1024px) {
  .content-row.row {
    flex-direction: column !important;
    flex-wrap: nowrap !important;
  }

  .content-row.row > .col-md-7 {
    width: 100%;
    max-width: 100%;
    flex: 0 0 auto;
  }

  .content-row.row > .col-md-5 {
    width: 100%;
    max-width: 100%;
    padding-left: 0 !important;
    padding-top: 16px !important;
  }

  .chart-area {
    min-height: 240px;
  }

  .legend-scroll {
    height: 220px !important;
  }
}
</style>
