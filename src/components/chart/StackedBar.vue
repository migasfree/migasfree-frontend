<template>
  <div>
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

      <q-card-actions align="around">
        <q-btn icon="mdi-database-search" flat @click="dataView">
          <q-tooltip>{{ $gettext('Data View') }}</q-tooltip>
        </q-btn>

        <q-btn icon="mdi-download" flat @click="saveImage">
          <q-tooltip>{{ $gettext('Save as Image') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="viewData">
      <q-card>
        <q-card-section>
          <div class="text-h5">
            <q-icon
              name="mdi-database-search"
              size="lg"
              class="vertical-middle"
            />
            <translate class="vertical-middle">Data</translate>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-table
            v-if="isChartVisible"
            class="q-ma-md"
            :pagination="{ rowsPerPage: 0 }"
            :data="data.series"
            hide-pagination
          >
            <q-tr slot="header">
              <q-th></q-th>
              <q-th v-for="(item, index) in data.xData" :key="index">{{
                item
              }}</q-th>
            </q-tr>

            <q-tr slot="body" slot-scope="props" :props="props">
              <q-th>{{ props.row.name }}</q-th>
              <q-td v-for="(item, index) in props.row.data" :key="index">
                {{ item.value }}
              </q-td>
            </q-tr>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="$gettext('Close')"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS
} from 'config/app.conf'

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
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
      },
      viewData: false
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
    },

    saveImage() {
      const linkSource = this.$refs.chart.getDataURL()
      const downloadLink = document.createElement('a')

      document.body.appendChild(downloadLink)
      downloadLink.href = linkSource
      downloadLink.target = '_self'
      downloadLink.download = `${this.title}.svg`
      downloadLink.click()
    },

    dataView() {
      this.viewData = true
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
