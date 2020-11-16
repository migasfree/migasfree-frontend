<template>
  <q-card class="q-ma-sm">
    <q-card-section>
      <div class="row">
        <div class="col">
          <div class="text-h5">{{ title }}</div>
        </div>

        <div class="col-auto">
          <q-chip size="md" clickable color="info" @click="goTo">{{
            data.total
          }}</q-chip>
        </div>
      </div>
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
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'

export default {
  name: 'NestedPieChart',
  props: {
    title: { type: String, required: true },
    data: {
      type: Object,
      required: true,
      default() {
        return { inner: [], outer: [], total: 0 }
      }
    },
    url: { type: String, required: false, default: '' }
  },
  data() {
    return {
      initOptions: {
        renderer: 'svg'
      },
      options: {
        animation: false,
        tooltip: {
          trigger: 'item',
          formatter: '{b} ({c}): <strong>{d}%</strong>'
        },
        series: [
          {
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              position: 'inner'
            },
            labelLine: {
              show: false
            },
            data: []
          },
          {
            type: 'pie',
            radius: ['40%', '55%'],
            label: {
              formatter: '{b} ({c}): {per|{d}%}',
              rich: {
                per: {
                  fontWeight: 'bold'
                }
              }
            },
            data: []
          }
        ]
      }
    }
  },
  watch: {
    data: function(val, oldVal) {
      this.options.series[0].data = val.inner
      this.options.series[1].data = val.outer
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
    },
    goTo() {
      if (this.url) {
        this.$router.push(this.url)
      }
    }
  }
}
</script>
