<template>
  <q-card class="q-ma-sm">
    <q-card-section>
      <div class="text-h5">{{ title }}</div>
    </q-card-section>

    <q-card-section class="echart-container">
      <v-chart
        ref="chart"
        :init-options="initOptions"
        :options="options"
        autoresize
        @click="passData"
      />
    </q-card-section>
  </q-card>
</template>

<style scoped>
.echart-container {
  width: 100%;
  height: 400px;
}
.echarts {
  width: 100%;
  height: 100%;
}
</style>

<script>
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import { MIGASFREE_CHART_COLORS } from 'config/app.conf'

export default {
  name: 'StackedBarChart',
  props: {
    title: { type: String, required: true },
    data: { type: Object, required: true }
  },
  data() {
    return {
      options: {
        animation: false,
        color: MIGASFREE_CHART_COLORS,
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        legend: {
          show: true,
          bottom: 'bottom'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: []
      },
      initOptions: {
        renderer: 'svg'
      }
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        this.options.series = val.series
        this.options.xAxis.data = val.xData
      },
      deep: true
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.windowResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.windowResize)
  },
  methods: {
    passData(params) {
      this.$emit('getLink', params)
    },
    windowResize() {
      if (this.$refs.chart !== null && this.$refs.chart !== undefined) {
        this.$refs.chart.resize()
      }
    }
  }
}
</script>
