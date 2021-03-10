<template>
  <q-card class="q-ma-sm">
    <q-card-section>
      <div class="row">
        <div class="col">
          <div class="text-h5">{{ title }}</div>
        </div>

        <div v-if="total" class="col-auto">
          <q-chip size="md" color="info" text-color="black">{{ total }}</q-chip>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="echart-container">
      <v-chart
        ref="chart"
        :init-options="initOptions"
        :option="options"
        :style="cssVars"
        autoresize
        @click="passData"
      /> </q-card-section
  ></q-card>
</template>

<script>
import * as echarts from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import {
  TooltipComponent,
  CalendarComponent,
  VisualMapComponent
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { format } from 'echarts/lib/util/time'
import { date } from 'quasar'

echarts.use([
  HeatmapChart,
  TooltipComponent,
  CalendarComponent,
  VisualMapComponent,
  SVGRenderer
])

export default {
  name: 'HeatMap',
  props: {
    data: {
      type: Array,
      required: true
    },
    start: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data() {
    return {
      initOptions: {
        renderer: 'svg'
      },
      options: {
        tooltip: {
          position: 'top',
          formatter: function(p) {
            const formated = format(p.data[0], '{yyyy}-{MM}-{dd}', true)
            return `${formated}: ${p.data[1]}`
          }
        },
        visualMap: {
          min: 1,
          max: 100,
          orient: 'horizontal',
          calculable: true,
          left: 'left',
          top: 40,
          textStyle: { color: this.$q.dark.isActive ? '#fff' : '#000' }
        },
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: [25, 25],
          range: [this.start, format(Date.now(), '{yyyy}-{MM}-{dd}', true)],
          itemStyle: {
            borderWidth: 0.5,
            color: this.$q.dark.isActive ? '#757575' : '#fff'
          },
          yearLabel: { show: true },
          dayLabel: {
            firstDay: 1,
            color: this.$q.dark.isActive ? '#fff' : '#000'
          },
          monthLabel: {
            color: this.$q.dark.isActive ? '#fff' : '#000'
          }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: []
        }
      }
    }
  },
  computed: {
    cssVars() {
      const diff = date.getDateDiff(
        this.options.calendar.range[1],
        this.options.calendar.range[0],
        'days'
      )
      return {
        '--variable-width': `${(diff / 7) * 25}px`
      }
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        this.$set(this.options.series, 'data', val)
        if (val.length > 0) {
          this.options.visualMap.max = Math.max.apply(
            Math,
            val.map(function(o) {
              return o[1]
            })
          )
        } else {
          this.options.visualMap.max = 1
        }
      },
      deep: true,
      immediate: true
    },

    '$q.dark.isActive'(val) {
      this.options.visualMap.textStyle.color = val ? '#fff' : '#000'
      this.options.calendar.monthLabel.color = val ? '#fff' : '#000'
      this.options.calendar.dayLabel.color = val ? '#fff' : '#000'
      this.options.calendar.itemStyle.color = val ? '#757575' : '#fff'
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.windowResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.windowResize)
  },
  methods: {
    windowResize() {
      if (this.$refs.chart !== null && this.$refs.chart !== undefined) {
        this.$refs.chart.resize()
      }
    },

    passData(params) {
      this.$emit('getDate', params)
    }
  }
}
</script>

<style scoped>
.echart-container {
  height: 400px;
  overflow: auto;
}
.echarts {
  width: calc(var(--variable-width) + 200px);
  height: 100%;
}
</style>
