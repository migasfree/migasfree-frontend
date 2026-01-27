<template>
  <q-card>
    <q-card-section class="q-pb-none">
      <div class="row">
        <div class="col">
          <div class="text-h5">{{ title }}</div>
        </div>

        <div v-if="total" class="col-auto">
          <q-btn
            size="lg"
            padding="xs md"
            :disable="data.total <= 0"
            color="info"
            text-color="black"
            :label="total"
            @click="$emit('total')"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section class="echart-container q-pa-none">
      <v-chart
        v-show="isChartVisible"
        ref="chart"
        :init-options="initOptions"
        :option="options"
        :update-options="updateOptions"
        :style="cssVars"
        autoresize
        manual-update
        @click="passData"
        @legendselectchanged="changeRange"
      />
      <BannerInfo v-if="noData" :message="$gettext('No data available.')" />
    </q-card-section>

    <q-card-actions v-show="isChartVisible" align="around" class="q-pt-none">
      <q-btn-dropdown flat stretch color="primary">
        <template #label>
          <q-icon :name="appIcon('download')" />

          <q-tooltip>
            {{ $gettext('Save as Image') }}
          </q-tooltip>
        </template>

        <q-list>
          <q-item clickable @click="saveSvgImage">SVG</q-item>
          <q-item clickable @click="savePngImage">PNG</q-item>
        </q-list>
      </q-btn-dropdown>
    </q-card-actions>
  </q-card>
</template>

<script>
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

import { appIcon } from 'composables/element'
import useDate from 'composables/date'
import { useChartExport } from 'composables/chart/export'
import { useChartOptions } from 'composables/chart/options'
import { useChartUtils } from 'composables/chart/utils'

import BannerInfo from 'components/ui/BannerInfo'

echarts.use([
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  CalendarComponent,
  VisualMapComponent,
  LegendComponent,
  SVGRenderer,
])

export default {
  name: 'HeatMap',
  components: { BannerInfo, VChart },
  props: {
    data: {
      type: Array,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  emits: ['get-date', 'total'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const { current } = useGettext()
    const { localeDate } = useDate()

    const chart = ref(null)

    const { saveSvgImage, savePngImage } = useChartExport()
    const { initOptions, getTextColor } = useChartOptions()
    useChartUtils(chart)

    const options = reactive({
      legend: {
        type: 'scroll',
        bottom: 20,
        selectedMode: 'single',
        selected: {},
        textStyle: {
          color: getTextColor(),
        },
      },
      textStyle: {
        fontFamily: 'Dosis',
        fontSize: 14,
      },
      tooltip: {
        position: 'top',
        formatter: (p) => {
          const formated = format(p.data[0], '{yyyy}-{MM}-{dd}', false)
          return `${formated}: ${p.data[1]}`
        },
      },
      visualMap: {
        min: 1,
        max: 100,
        orient: 'horizontal',
        calculable: true,
        left: 'center',
        top: 40,
        textStyle: { color: getTextColor() },
      },
      calendar: {
        top: 120,
        left: 60,
        right: 30,
        cellSize: [25, 25],
        range: [props.start, format(Date.now(), '{yyyy}-{MM}-{dd}', true)],
        itemStyle: {
          borderWidth: 0.5,
          color: $q.dark.isActive ? '#757575' : '#fff',
        },
        yearLabel: { show: true, margin: 30 },
        dayLabel: {
          firstDay: current.startsWith('es') ? 1 : 0,
          color: getTextColor(),
          nameMap: localeDate.daysShort,
        },
        monthLabel: {
          color: getTextColor(),
          nameMap: localeDate.monthsShort,
        },
      },
      series: [],
    })

    const updateOptions = reactive({
      replaceMerge: ['series'],
    })

    const cssVars = computed(() => {
      const diff = date.getDateDiff(
        options.calendar.range[1],
        options.calendar.range[0],
        'days',
      )
      return {
        '--variable-width': `${(diff / 7) * 25}px`,
      }
    })

    const isChartVisible = computed(() => {
      return props.total > 0
    })

    const noData = computed(() => {
      return props.total === 0
    })

    const yearsSummary = computed(() => {
      const result = {}

      props.data.forEach((item) => {
        const year = item[0].split('-')[0]
        result[year] = (result[year] || 0) + item[1]
      })

      return result
    })

    const monthsSummary = computed(() => {
      const result = {}

      props.data.forEach((item) => {
        const parts = item[0].split('-')
        const index = `${parts[0]}-${parts[1]}`
        result[index] = (result[index] || 0) + item[1]
      })

      return result
    })

    const passData = (params) => {
      emit('get-date', params)
    }

    const seriesByYear = (data) => {
      const series = {}

      data.forEach((item) => {
        const year = item[0].split('-')[0]
        if (year in series) series[year].push(item)
        else series[year] = [item]
      })

      return series
    }

    const changeRange = ($evt) => {
      if (chart.value)
        chart.value.setOption({
          calendar: {
            range: $evt.name,
          },
        })
    }

    const legendFormatter = (name) => {
      return `${name} (${yearsSummary.value[name]})`
    }

    const monthLabelFormatter = (param) => {
      const index = `${param.yyyy}-${param.MM}`
      const value = monthsSummary.value[index]
      return value ? `${param.nameMap} (${value})` : param.nameMap
    }

    watch(
      () => props.data,
      (val) => {
        const series = []
        const years = {}

        Object.entries(seriesByYear(val)).map(([index, year]) => {
          years[index] = false
          series.push({
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 0,
            data: year,
            name: index,
          })
        })

        const maxYear = Object.keys(years).length
          ? Math.max(...Object.keys(years).map(Number))
          : new Date().getFullYear()

        years[maxYear] = true

        let visualMapMax = 1
        if (val.length > 0)
          visualMapMax = Math.max(...val.map((item) => item[1]))

        if (chart.value) {
          chart.value.setOption(
            {
              series,
              legend: {
                selected: years,
                formatter: legendFormatter,
              },
              calendar: {
                range: maxYear,
                monthLabel: {
                  formatter: monthLabelFormatter,
                },
              },
              visualMap: { max: visualMapMax },
            },
            {
              replaceMerge: ['series'],
            },
          )
        } else {
          options.series = series

          options.legend.selected = years
          options.legend.formatter = legendFormatter

          options.calendar.range = maxYear
          options.calendar.monthLabel.formatter = monthLabelFormatter

          options.visualMap.max = visualMapMax
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () => $q.dark.isActive,
      (val) => {
        const textColor = getTextColor()

        if (chart.value) {
          chart.value.setOption({
            visualMap: {
              textStyle: { color: textColor },
            },
            calendar: {
              monthLabel: { color: textColor },
              dayLabel: { color: textColor },
              itemStyle: { color: val ? '#757575' : '#fff' },
            },
            legend: {
              textStyle: { color: textColor },
            },
          })
        } else {
          options.visualMap.textStyle.color = textColor
          options.calendar.monthLabel.color = textColor
          options.calendar.dayLabel.color = textColor
          options.calendar.itemStyle.color = val ? '#757575' : '#fff'
          options.legend.textStyle.color = textColor
        }
      },
    )

    return {
      chart,
      initOptions,
      options,
      updateOptions,
      cssVars,
      isChartVisible,
      noData,
      passData,
      changeRange,
      saveSvgImage: () => saveSvgImage(chart.value, props.title),
      savePngImage: () => savePngImage(chart.value, props.title),
      appIcon,
    }
  },
}
</script>

<style scoped>
.echart-container {
  height: 400px;
  overflow: auto;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>
