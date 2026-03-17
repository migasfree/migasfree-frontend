<template>
  <div class="pie-chart-wrapper panel column">
    <!-- Header Section -->
    <div class="panel-header row items-center justify-between no-wrap q-mb-md">
      <!-- Left side: Title + Total Badge -->
      <div class="title-group row items-center no-wrap col-grow">
        <!-- eslint-disable-next-line vuejs-accessibility/heading-has-content -->
        <h2 class="panel-title row items-center no-wrap q-mb-none">
          <TextTooltip :text="title" />
          <q-btn
            v-if="data.total > 0"
            unelevated
            no-caps
            class="total-badge q-ml-md"
            :color="critical && data.total > 0 ? 'negative' : 'secondary'"
            text-color="white"
            :aria-label="$gettext('View All')"
            @click="goTo"
          >
            <span class="text-body2 text-weight-bolder">{{ data.total }}</span>
            <q-tooltip>{{ $gettext('View All') }}</q-tooltip>
          </q-btn>
        </h2>
      </div>

      <!-- Right side: Actions -->
      <div
        v-show="isChartVisible"
        class="actions-group row items-center no-wrap q-gutter-x-xs"
      >
        <q-btn
          flat
          dense
          size="md"
          class="q-pa-xs rounded-borders q-mr-xs"
          color="brand-secondary"
          :icon="appIcon('data')"
          :aria-label="$gettext('Data View')"
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
            class="echarts"
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
          class="text-center q-pa-xl absolute-center text-grey-8"
        >
          <q-icon
            name="mdi-chart-arc"
            size="xl"
            class="q-mb-sm"
            aria-hidden="true"
          />
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
          <PieLegend
            :flat-data="flatData"
            :data-total="data.total || 0"
            :hover-index="hoverIndex"
            :hover-series="hoverSeries"
            :is-dark="isDark"
            :get-outer-color="getOuterColor"
            @highlight="highlightChart"
            @downplay="downplayChart"
            @item-click="passData"
          />
        </q-scroll-area>
      </div>
    </div>

    <!-- Data Table Dialog -->
    <PieDataDialog
      v-model="viewData"
      :title="title"
      :data-grid="dataGrid"
      :columns="columns"
      @row-click="rowClick"
    />
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  shallowRef,
  getCurrentInstance,
} from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import VChart from 'vue-echarts'

import * as echarts from 'echarts/core'
import { PieChart as EchartsPie } from 'echarts/charts'
import {
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

import { useUiStore } from 'stores/ui'
import { appIcon } from 'composables/element'
import { useChartExport } from 'composables/chart/export'
import { useChartUtils } from 'composables/chart/utils'
import { useSmartRequest } from 'composables/smartRequest'
import { usePieChart } from 'composables/chart/pie'

import ExportMenu from 'components/chart/ExportMenu'
import TextTooltip from 'components/ui/TextTooltip'
import PieLegend from 'components/chart/PieLegend.vue'
import PieDataDialog from 'components/chart/PieDataDialog.vue'

echarts.use([
  EchartsPie,
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
const { smartRequest } = useSmartRequest()
const instance = getCurrentInstance()

const chart = ref(null)
const data = reactive({})
const hoverIndex = ref(-1)
const hoverSeries = ref(-1)
const loading = ref(false)
const viewData = ref(false)
const dataGrid = shallowRef([])
const currentGroupByKey = ref(null)

const isDark = computed(() => $q.dark.isActive)

// Composable integration
const {
  initOptions,
  loadingOptions,
  options,
  buildNormalSeries,
  buildNestedSeries,
  getChartColors,
  dispatchChartAction,
} = usePieChart(props.title, chart, isDark)

const { groupBy } = useChartUtils(chart)
const { saveSvgImage, savePngImage, exportTableToJson } = useChartExport()

const columns = [
  { name: 'name', field: 'name', label: $gettext('Name'), align: 'left' },
  { name: 'value', field: 'value', label: $gettext('Value') },
]

// --- Computed ---

const isNested = computed(() => 'inner' in data)

const isChartVisible = computed(
  () => Object.keys(data).length === 0 || data.total > 0,
)

const noData = computed(() => !('total' in data) || data.total === 0)

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
  const indexedOuter = data.outer.map((ite, idx) => ({ ...ite, index: idx }))
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

  dispatchChartAction('highlight', { seriesIndex, dataIndex: index })
  dispatchChartAction('showTip', { seriesIndex, dataIndex: index })
}

const downplayChart = (sIndex = null) => {
  const seriesIndex = sIndex !== null ? sIndex : targetSeriesIndex.value
  hoverIndex.value = -1
  hoverSeries.value = -1

  dispatchChartAction('downplay', { seriesIndex })
  dispatchChartAction('hideTip', {})
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

const rowClick = (row) => {
  passData({ data: row })
}

const goTo = () => {
  if (props.url && Object.keys(props.url).length > 0) {
    const currentRouter = router || instance?.proxy?.$router
    if (currentRouter) currentRouter.push(props.url)
  }
}

// --- Data View ---

const dataView = () => {
  viewData.value = true

  if (options.value.series.length === 2) {
    const keys = Object.keys(options.value.series[0].data[0])
    const groupByKey = keys.filter((x) => !['name', 'value'].includes(x))
    const groupByData = groupBy(options.value.series[1].data, groupByKey)

    dataGrid.value = options.value.series[0].data.map((item) => {
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

const exportData = (format) => {
  if (format === 'csv') {
    // Basic CSV fallback if not using the pie dialog export
    import('composables/chart/export').then(({ useChartExport: useExport }) => {
      const { exportTableToCsv } = useExport()
      exportTableToCsv(`${props.title}.csv`, columns, flatData.value)
    })
  } else {
    exportTableToJson(`${props.title}.json`, flatData.value)
  }
}

const saveSvg = () => saveSvgImage(chart.value, props.title)
const savePng = () => savePngImage(chart.value, props.title)

// --- Lifecycle ---

onMounted(async () => {
  loading.value = true
  try {
    const { data: response } = await smartRequest(props.endPoint)
    const nested = 'inner' in response

    if (nested && response.inner.length > 0) {
      const keys = Object.keys(response.inner[0] || {})
      currentGroupByKey.value = keys.find((x) => !['name', 'value'].includes(x))
    }

    options.value.series = nested ? buildNestedSeries() : buildNormalSeries()
    Object.assign(data, response)

    if (nested) {
      options.value.series[0].data = data.inner
      options.value.series[1].data = data.outer
    } else {
      options.value.series[0].data = data.data
    }
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
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

.panel-title {
  flex: 0 1 auto;
  max-width: 100%;

  & > :first-child {
    flex: 0 1 auto;
  }

  & > .total-badge {
    flex: 0 0 auto;
    padding: 2px 8px;
  }
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

.legend-scroll {
  height: 300px;
  width: 100%;
}

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
