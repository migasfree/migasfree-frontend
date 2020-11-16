<template>
  <q-card class="q-ma-sm">
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
import { parseDate } from 'echarts/lib/util/number'
import { formatTime } from 'echarts/lib/util/format'

export default {
  name: 'HeatMap',
  props: {
    data: {
      type: Object,
      required: true,
      default() {
        return { data: [] }
      }
    },
    start: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      initOptions: {
        renderer: 'svg'
      },
      options: {
        tooltip: {},
        visualMap: {
          min: 0,
          max: 10000,
          type: 'piecewise',
          orient: 'horizontal',
          left: 'center',
          top: 65,
          textStyle: { color: '#000' }
        },
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: ['auto', 13],
          range: [
            this.start,
            formatTime('yyyy-MM-dd', Date.now())
          ],
          itemStyle: { borderWidth: 0.5 },
          yearLabel: { show: false }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: this.getVirtualData(2020)
        }
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
    },
    getVirtualData(year) {
      year = year || '2017'
      var date = +parseDate(year + '-01-01')
      var end = +parseDate(+year + 1 + '-01-01')
      var dayTime = 3600 * 24 * 1000
      var data = []
      for (var time = date; time < end; time += dayTime) {
        data.push([
          formatTime('yyyy-MM-dd', time),
          Math.floor(Math.random() * 10000)
        ])
      }
      console.log(data)
      console.log()
      return data
    }
  }
}
</script>

<style scoped>
.echart-container {
  /* width: 100%; */
  width: 600px;
  height: 400px;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>
