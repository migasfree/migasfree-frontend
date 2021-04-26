<template>
  <q-card class="q-ma-sm">
    <q-card-section>
      <div class="text-h5">{{ title }}</div>
    </q-card-section>

    <q-card-section class="echart-container">
      <v-chart
        v-show="isChartVisible"
        ref="chart"
        :init-options="initOptions"
        :option="options"
        :loading="loading"
        :loading-options="loadingOptions"
        autoresize
        @click="passData"
      />
      <q-banner v-if="noData" rounded class="bg-warning text-black">
        <translate>No data available.</translate>
      </q-banner>
    </q-card-section>
  </q-card>
</template>

<script>
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  MarkPointComponent
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS
} from 'config/app.conf'

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  MarkPointComponent,
  SVGRenderer
])

export default {
  name: 'StackedBarChart',
  props: {
    title: { type: String, required: true },
    endPoint: {
      type: String,
      required: false,
      default: ''
    },
    initialData: {
      type: Object,
      required: false,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      data: this.initialData,
      options: {
        animation: false,
        color: this.$q.dark.isActive
          ? MIGASFREE_CHART_DARK_COLORS
          : MIGASFREE_CHART_COLORS,
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        legend: {
          show: true,
          bottom: 'bottom',
          textStyle: {
            color: this.$q.dark.isActive ? '#fff' : '#333'
          }
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: {
            lineStyle: {
              color: this.$q.dark.isActive ? '#fff' : '#333'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: this.$q.dark.isActive ? '#fff' : '#333'
            }
          }
        },
        series: [],
        title: {
          text: this.title,
          show: false
        },
        toolbox: {
          show: true,
          itemSize: 20,
          iconStyle: {
            color: this.$q.dark.isActive ? 'white' : 'black'
          },
          feature: {
            dataView: {
              readOnly: true,
              title: this.$gettext('Data View'),
              icon:
                'path://M18.68,12.32C16.92,10.56 14.07,10.57 12.32,12.33C10.56,14.09 10.56,16.94 12.32,18.69C13.81,20.17 16.11,20.43 17.89,19.32L21,22.39L22.39,21L19.3,17.89C20.43,16.12 20.17,13.8 18.68,12.32M17.27,17.27C16.29,18.25 14.71,18.24 13.73,17.27C12.76,16.29 12.76,14.71 13.74,13.73C14.71,12.76 16.29,12.76 17.27,13.73C18.24,14.71 18.24,16.29 17.27,17.27M10.9,20.1C10.25,19.44 9.74,18.65 9.42,17.78C6.27,17.25 4,15.76 4,14V17C4,19.21 7.58,21 12,21V21C11.6,20.74 11.23,20.44 10.9,20.1M4,9V12C4,13.68 6.07,15.12 9,15.7C9,15.63 9,15.57 9,15.5C9,14.57 9.2,13.65 9.58,12.81C6.34,12.3 4,10.79 4,9M12,3C7.58,3 4,4.79 4,7C4,9 7,10.68 10.85,11H10.9C12.1,9.74 13.76,9 15.5,9C16.41,9 17.31,9.19 18.14,9.56C19.17,9.09 19.87,8.12 20,7C20,4.79 16.42,3 12,3Z'
            },
            saveAsImage: {
              name: this.title,
              title: this.$gettext('Save as Image'),
              icon: 'path://M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z'
            }
          }
        }
      },
      initOptions: {
        renderer: 'svg'
      },
      loading: false,
      loadingOptions: {
        showSpinner: true,
        text: this.$gettext('Loading data...'),
        color: '#39BEDA',
        textColor: this.$q.dark.isActive
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(0, 0, 0, 0.5)',
        maskColor: this.$q.dark.isActive ? '#3A4149' : 'white'
      }
    }
  },
  computed: {
    isChartVisible() {
      return (
        Object.keys(this.data).length > 0 ||
        ('series' in this.data && this.data.series.length > 0)
      )
    },

    noData() {
      return !'series' in this.data
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        if ('series' in val) this.$set(this.options, 'series', val.series)
        if ('xData' in val) this.$set(this.options.xAxis, 'data', val.xData)
      },
      deep: true,
      immediate: true
    },

    initialData: {
      handler: function(val, oldVal) {
        this.data = val
      },
      deep: true,
      immediate: true
    },

    '$q.dark.isActive'(val) {
      this.options.color = val
        ? MIGASFREE_CHART_DARK_COLORS
        : MIGASFREE_CHART_COLORS
      this.options.legend.textStyle.color = val ? '#fff' : '#333'
      this.options.xAxis.axisLine.lineStyle.color = val ? '#fff' : '#333'
      this.options.yAxis.axisLine.lineStyle.color = val ? '#fff' : '#333'
      this.options.toolbox.iconStyle.color = val ? 'white' : 'black'
    }
  },
  async mounted() {
    if (!this.endPoint) return

    this.loading = true
    await this.$axios
      .get(this.endPoint)
      .then((response) => {
        const series = []

        Object.entries(response.data.data).map(([key, val]) => {
          series.push({
            type: 'line',
            smooth: true,
            name: key,
            data: val
          })
        })
        this.data = {
          xData: response.data.x_labels,
          series
        }
      })
      .catch((error) => {
        this.$store.dispatch('ui/notifyError', error)
      })
      .finally(() => {
        this.loading = false
      })
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
