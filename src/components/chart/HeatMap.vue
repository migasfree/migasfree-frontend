<template>
  <q-card class="q-ma-sm">
    <q-card-section>
      <div class="row">
        <div class="col">
          <div class="text-h5">{{ title }}</div>
        </div>

        <div v-if="total" class="col-auto">
          <q-chip size="md" color="info">{{ total }}</q-chip>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="echart-container">
      <v-chart
        ref="chart"
        :init-options="initOptions"
        :options="options"
        autoresize
      /> </q-card-section
  ></q-card>
</template>

<script>
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/calendar'
import 'echarts/lib/component/visualMap'
import { parseDate } from 'echarts/lib/util/number'
import { formatTime } from 'echarts/lib/util/format'

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
            const format = formatTime('yyyy-MM-dd', p.data[0])
            return `${format}: ${p.data[1]}`
          }
        },
        visualMap: {
          min: 1,
          max: 100,
          orient: 'horizontal',
          calculable: true,
          left: 'center',
          top: 40,
          textStyle: { color: '#000' }
        },
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: [25, 25],
          range: [this.start, formatTime('yyyy-MM-dd', Date.now())],
          itemStyle: { borderWidth: 0.5 },
          yearLabel: { show: true }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: []
        }
      }
    }
  },
  watch: {
    data: function(val, oldVal) {
      if (val.length > 0) {
        this.options.series.data = val
        this.options.visualMap.max = Math.max.apply(
          Math,
          val.map(function(o) {
            return o[1]
          })
        )
      }
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
    }
  }
}
</script>

<style scoped>
.echart-container {
  /* width: 100%; */
  /* width: 600px; */
  min-width: 600px;
  max-width: 10000px;
  height: 400px;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>
