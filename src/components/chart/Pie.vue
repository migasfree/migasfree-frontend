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
        :options="options"
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
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS
} from 'config/app.conf'

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
        series: []
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
    }
  },
  async mounted() {
    this.$refs.chart.showLoading({
      showSpinner: true,
      text: this.$gettext('Loading data...'),
      color: '#39BEDA',
      textColor: this.$q.dark.isActive
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0, 0, 0, 0.5)',
      maskColor: this.$q.dark.isActive ? '#3A4149' : 'white'
    })
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
        this.$refs.chart.hideLoading()
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
