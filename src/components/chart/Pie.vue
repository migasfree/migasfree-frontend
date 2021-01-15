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
            @click="goTo"
            >{{ data.total }}</q-chip
          >
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
    data: {
      type: Object,
      required: true,
      default() {
        return { data: [], total: 0 }
      }
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
        series: [
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
        ]
      }
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        this.options.series[0].data = val.data
      },
      deep: true
    },
    '$q.dark.isActive'(val) {
      this.options.color = val
        ? MIGASFREE_CHART_DARK_COLORS
        : MIGASFREE_CHART_COLORS
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
