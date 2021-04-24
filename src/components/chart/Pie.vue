<template>
  <q-card class="q-ma-sm">
    <q-card-section>
      <div class="row">
        <div class="col">
          <div class="text-h5">{{ title }}</div>
        </div>

        <div class="col-auto">
          <q-chip
            size="md"
            :clickable="data.total > 0"
            :color="critical ? 'negative' : 'info'"
            :text-color="critical ? 'white' : 'black'"
            @click="goTo"
            >{{ data.total }}</q-chip
          >
        </div>
      </div>
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
import { PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  ToolboxComponent,
  TitleComponent
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS
} from 'config/app.conf'

echarts.use([
  PieChart,
  TooltipComponent,
  ToolboxComponent,
  TitleComponent,
  SVGRenderer
])

export default {
  name: 'PieChart',
  props: {
    title: { type: String, required: true },
    endPoint: {
      type: String,
      required: true
    },
    url: {
      type: Object,
      required: false,
      default() {
        return {}
      }
    },
    critical: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      data: {},
      initOptions: {
        renderer: 'svg'
      },
      options: {
        animation: false,
        tooltip: {
          trigger: 'item',
          formatter: '{b} ({c}): <strong>{d}%</strong>'
        },
        color: this.$q.dark.isActive
          ? MIGASFREE_CHART_DARK_COLORS
          : MIGASFREE_CHART_COLORS,
        series: [],
        title: {
          text: this.title
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
      normalSeries: [
        {
          type: 'pie',
          radius: ['30%', '65%'],
          center: ['50%', '60%'],
          data: [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            color: this.$q.dark.isActive ? 'white' : 'black'
          }
        }
      ],
      nestedSeries: [
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
            color: this.$q.dark.isActive ? 'white' : 'black',
            formatter: '{b} ({c}): {per|{d}%}',
            rich: {
              per: {
                fontWeight: 'bold'
              }
            }
          },
          data: []
        }
      ],
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
      return Object.keys(this.data).length === 0 || this.data.total > 0
    },

    noData() {
      return !'total' in this.data || this.data.total === 0
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        if ('inner' in val) {
          this.$set(this.options.series[0], 'data', val.inner)
          this.$set(this.options.series[1], 'data', val.outer)
        } else {
          this.$set(this.options.series[0], 'data', val.data)
        }
      },
      deep: true
    },

    '$q.dark.isActive'(val) {
      this.options.color = val
        ? MIGASFREE_CHART_DARK_COLORS
        : MIGASFREE_CHART_COLORS

      this.options.toolbox.iconStyle.color = val ? 'white' : 'black'

      if ('series' in this.options) {
        this.options.series.map((item) => {
          item.label.color = val ? 'white' : 'black'
        })
      }
    }
  },
  async mounted() {
    this.loading = true
    await this.$axios
      .get(this.endPoint)
      .then((response) => {
        if ('inner' in response.data) {
          this.$set(this.options, 'series', this.nestedSeries)
        } else {
          this.$set(this.options, 'series', this.normalSeries)
        }
        this.data = response.data
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
      this.$emit('getLink', Object.assign(params, { url: this.url }))
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
