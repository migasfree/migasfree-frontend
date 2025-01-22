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
        @click="passData"
        @legendselectchanged="changeRange"
      />
      <BannerInfo
        v-if="noData"
        :message="$gettext('No data available.')"
      /> </q-card-section
  ></q-card>
</template>

<script>
import {
  ref,
  reactive,
  computed,
  watch,
  onBeforeMount,
  onBeforeUnmount,
} from 'vue'
import { useQuasar, date } from 'quasar'
import { useGettext } from 'vue3-gettext'

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
  components: { BannerInfo },
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

    const initOptions = reactive({
      renderer: 'svg',
    })

    const options = reactive({
      legend: {
        type: 'scroll',
        bottom: 20,
        selectedMode: 'single',
        selected: {},
        textStyle: {
          color: $q.dark.isActive ? '#fff' : '#000',
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
        textStyle: { color: $q.dark.isActive ? '#fff' : '#000' },
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
          color: $q.dark.isActive ? '#fff' : '#000',
          nameMap: localeDate.daysShort,
        },
        monthLabel: {
          color: $q.dark.isActive ? '#fff' : '#000',
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

    const windowResize = () => {
      if (chart.value !== null && chart.value !== undefined) {
        chart.value.resize()
      }
    }

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
      chart.value.setOption({
        calendar: {
          range: $evt.name,
        },
      })
    }

    onBeforeMount(() => {
      window.addEventListener('resize', windowResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', windowResize)
    })

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
          ? Object.keys(years).reduce(function (a, b) {
              return Math.max(parseInt(a), parseInt(b))
            })
          : new Date().getFullYear()

        years[maxYear] = true

        let visualMapMax = 1
        if (val.length > 0) {
          visualMapMax = Math.max.apply(
            Math,
            val.map(function (o) {
              return o[1]
            }),
          )
        }

        if (chart.value !== null && chart.value !== undefined) {
          chart.value.setOption(
            {
              series,
              legend: {
                selected: years,
                formatter: (name) => {
                  return `${name} (${yearsSummary.value[name]})`
                },
              },
              calendar: {
                range: maxYear,
                monthLabel: {
                  formatter: (param) => {
                    const index = `${param.yyyy}-${param.MM}`
                    const value = monthsSummary.value[index]
                    return value ? `${param.nameMap} (${value})` : param.nameMap
                  },
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
          options.legend.formatter = (name) => {
            return `${name} (${yearsSummary.value[name]})`
          }

          options.calendar.range = maxYear
          options.calendar.monthLabel.formatter = (param) => {
            const index = `${param.yyyy}-${param.MM}`
            const value = monthsSummary.value[index]
            return value ? `${param.nameMap} (${value})` : param.nameMap
          }

          options.visualMap.max = visualMapMax
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () => $q.dark.isActive,
      (val) => {
        options.visualMap.textStyle.color = val ? '#fff' : '#000'
        options.calendar.monthLabel.color = val ? '#fff' : '#000'
        options.calendar.dayLabel.color = val ? '#fff' : '#000'
        options.calendar.itemStyle.color = val ? '#757575' : '#fff'
        options.legend.textStyle.color = val ? '#fff' : '#000'
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
