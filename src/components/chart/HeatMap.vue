<template>
  <div class="chart-container">
    <div class="panel glass-panel overflow-hidden">
      <!-- Header -->
      <div
        class="panel-header q-px-lg q-py-md row items-center justify-between no-wrap"
      >
        <div class="title-group row items-center no-wrap col-grow">
          <h2 class="panel-title ellipsis q-ma-none" :title="title">
            {{ title }}
          </h2>
          <q-btn
            v-if="total"
            unelevated
            dense
            no-caps
            class="total-badge q-ml-sm"
            color="warning-surface"
            text-color="brand-primary"
            @click="$emit('total')"
          >
            <span class="text-weight-bolder">{{ total }}</span>
            <q-tooltip>{{ $gettext('View All') }}</q-tooltip>
          </q-btn>
        </div>

        <div
          v-show="isChartVisible"
          class="actions-group row items-center no-wrap q-gutter-x-xs q-ml-sm"
        >
          <ExportMenu
            @save-svg="saveSvg"
            @save-png="savePng"
            @export-data="exportData"
          />
        </div>
      </div>

      <!-- Chart Area -->
      <div class="chart-wrapper q-px-md q-pb-md">
        <v-chart
          v-show="isChartVisible"
          ref="chart"
          class="echarts"
          :init-options="initOptions"
          :option="options"
          :update-options="updateOptions"
          :style="cssVars"
          autoresize
          manual-update
          @click="passData"
          @legendselectchanged="changeRange"
        />

        <!-- No data fallback -->
        <div v-if="noData" class="text-center q-pa-xl opacity-50">
          <q-icon
            name="mdi-calendar-blank-outline"
            size="xl"
            class="q-mb-sm"
            aria-hidden="true"
          />
          <div class="text-subtitle1">
            {{ $gettext('No data available.') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { useGettext } from 'vue3-gettext'
import VChart from 'vue-echarts'

import * as echarts from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  CalendarComponent,
  VisualMapComponent,
  LegendComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { format } from 'echarts/lib/util/time'

import useDate from 'composables/date'
import { useChartExport } from 'composables/chart/export'
import { useChartOptions } from 'composables/chart/options'
import { useChartUtils } from 'composables/chart/utils'

import ExportMenu from 'components/chart/ExportMenu'

echarts.use([
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  CalendarComponent,
  VisualMapComponent,
  LegendComponent,
  SVGRenderer,
])

defineOptions({ name: 'HeatMap' })

const props = defineProps({
  data: { type: Array, required: true },
  start: { type: String, required: true },
  title: { type: String, required: true },
  total: { type: Number, default: 0 },
})

const emit = defineEmits(['get-date', 'total'])

const $q = useQuasar()
const { $gettext, current } = useGettext()
const { localeDate } = useDate()

const chart = ref(null)

const { initOptions } = useChartOptions()
const { saveSvgImage, savePngImage, exportTableToCsv, exportTableToJson } =
  useChartExport()
useChartUtils(chart)

// --- Dark-mode helpers ---

const isDark = computed(() => $q.dark.isActive)
const textColor = computed(() =>
  isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
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
}))

const calendarStyle = computed(() => ({
  itemStyle: {
    borderWidth: 2,
    borderColor: isDark.value ? '#0f172a' : '#fff',
    color: isDark.value ? 'rgba(255,255,255,0.03)' : '#f8fafc',
    borderRadius: 3,
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      width: 1,
      type: 'solid',
    },
  },
}))

const visualMapColors = computed(() =>
  isDark.value ? ['#1e293b', '#fbbf24'] : ['#f1f5f9', '#431407'],
)

// --- Chart options ---

const options = reactive({
  backgroundColor: 'transparent',
  legend: {
    type: 'scroll',
    bottom: 20,
    selectedMode: 'single',
    selected: {},
    textStyle: { color: textColor.value, fontFamily: 'Dosis' },
    pageTextStyle: { color: textColor.value },
    pageIconColor: isDark.value ? '#fff' : '#2f4554',
  },
  textStyle: { fontFamily: 'Dosis', fontSize: 14 },
  tooltip: {
    position: 'top',
    appendToBody: true,
    ...tooltipStyle.value,
    formatter: (p) => {
      const formatted = format(p.data[0], '{yyyy}-{MM}-{dd}', false)
      return `${formatted}: <strong>${p.data[1]}</strong>`
    },
  },
  visualMap: {
    min: 1,
    max: 100,
    orient: 'horizontal',
    calculable: true,
    left: 'center',
    top: 0,
    itemWidth: 15,
    itemHeight: 140,
    textStyle: { color: textColor.value, fontFamily: 'Dosis' },
    inRange: { color: visualMapColors.value },
  },
  calendar: {
    top: 60,
    left: 60,
    right: 30,
    cellSize: [25, 25],
    range: [props.start, format(Date.now(), '{yyyy}-{MM}-{dd}', true)],
    ...calendarStyle.value,
    yearLabel: { show: true, margin: 30 },
    dayLabel: {
      firstDay: current.startsWith('es') ? 1 : 0,
      color: textColor.value,
      nameMap: localeDate.daysShort,
      fontFamily: 'Dosis',
    },
    monthLabel: {
      color: textColor.value,
      nameMap: localeDate.monthsShort,
      fontFamily: 'Dosis',
    },
  },
  series: [],
})

const updateOptions = { replaceMerge: ['series'] }

// --- Computed ---

const cssVars = computed(() => {
  const diff = date.getDateDiff(
    options.calendar.range[1],
    options.calendar.range[0],
    'days',
  )
  return { '--variable-width': `${(diff / 7) * 25}px` }
})

const isChartVisible = computed(() => props.total > 0)
const noData = computed(() => props.total === 0)

// --- Data aggregation (for legend/month labels) ---

const yearsSummary = computed(() =>
  props.data.reduce((acc, item) => {
    const year = item[0].split('-')[0]
    acc[year] = (acc[year] || 0) + item[1]
    return acc
  }, {}),
)

const monthsSummary = computed(() =>
  props.data.reduce((acc, item) => {
    const [y, m] = item[0].split('-')
    const key = `${y}-${m}`
    acc[key] = (acc[key] || 0) + item[1]
    return acc
  }, {}),
)

// --- Series helpers ---

const groupByYear = (dataArr) =>
  dataArr.reduce((acc, item) => {
    const year = item[0].split('-')[0]
    ;(acc[year] ??= []).push(item)
    return acc
  }, {})

const legendFormatter = (name) => `${name} (${yearsSummary.value[name]})`

const monthLabelFormatter = (param) => {
  const value = monthsSummary.value[`${param.yyyy}-${param.MM}`]
  return value ? `${param.nameMap} (${value})` : param.nameMap
}

// --- Actions ---

const passData = (params) => emit('get-date', params)

const changeRange = (evt) => {
  chart.value?.setOption({ calendar: { range: evt.name } })
}

const saveSvg = () => saveSvgImage(chart.value, props.title)
const savePng = () => savePngImage(chart.value, props.title)

const exportColumns = [
  { label: $gettext('Date'), field: 0 },
  { label: $gettext('Value'), field: 1 },
]

const exportData = (fmt) => {
  const filename = `${props.title}.${fmt}`
  if (fmt === 'csv') {
    exportTableToCsv(filename, exportColumns, props.data)
  } else {
    exportTableToJson(filename, props.data)
  }
}

// --- Watchers ---

watch(
  () => props.data,
  (val) => {
    const yearGroups = groupByYear(val)
    const years = Object.fromEntries(
      Object.keys(yearGroups).map((y) => [y, false]),
    )
    const series = Object.entries(yearGroups).map(([name, items]) => ({
      type: 'heatmap',
      coordinateSystem: 'calendar',
      calendarIndex: 0,
      data: items,
      name,
    }))

    const maxYear = Object.keys(years).length
      ? Math.max(...Object.keys(years).map(Number))
      : new Date().getFullYear()

    years[maxYear] = true

    const visualMapMax =
      val.length > 0 ? Math.max(...val.map((item) => item[1])) : 1

    const updatedOptions = {
      series,
      legend: { selected: years, formatter: legendFormatter },
      calendar: {
        range: maxYear,
        monthLabel: { formatter: monthLabelFormatter },
      },
      visualMap: { max: visualMapMax },
    }

    if (chart.value) {
      chart.value.setOption(updatedOptions, { replaceMerge: ['series'] })
    } else {
      Object.assign(options.legend, updatedOptions.legend)
      Object.assign(options.calendar, updatedOptions.calendar)
      options.series = series
      options.visualMap.max = visualMapMax
    }
  },
  { deep: true, immediate: true },
)

watch(isDark, (val) => {
  const tc = val ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'

  const darkUpdate = {
    tooltip: tooltipStyle.value,
    visualMap: {
      textStyle: { color: tc },
      inRange: { color: visualMapColors.value },
    },
    calendar: {
      ...calendarStyle.value,
      monthLabel: { color: tc },
      dayLabel: { color: tc },
    },
    legend: {
      textStyle: { color: tc },
      pageTextStyle: { color: tc },
      pageIconColor: val ? '#fff' : '#2f4554',
    },
  }

  if (chart.value) {
    chart.value.setOption(darkUpdate)
  } else {
    Object.assign(options.tooltip, darkUpdate.tooltip)
    Object.assign(options.visualMap, darkUpdate.visualMap)
    Object.assign(options.calendar, darkUpdate.calendar)
    Object.assign(options.legend, darkUpdate.legend)
  }
})
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  position: relative;
  overflow: auto;
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
</style>
