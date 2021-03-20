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
            clickable
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
import { TooltipComponent, ToolboxComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS
} from 'config/app.conf'

echarts.use([PieChart, TooltipComponent, ToolboxComponent, SVGRenderer])

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
          iconStyle: {
            borderColor: this.$q.dark.isActive ? 'white' : 'black'
          },
          feature: {
            dataView: {
              readOnly: true,
              title: this.$gettext('Data View')
            },
            saveAsImage: {
              name: this.title,
              title: this.$gettext('Save as Image')
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

      this.options.toolbox.iconStyle.borderColor = val ? 'white' : 'black'

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
