<template>
  <div>
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

      <q-card-actions v-show="isChartVisible" align="around">
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
            v-for="(serie, index) in dataGrid"
            :key="index"
            class="q-ma-md"
            :title="serie.title"
            :data="serie.data"
            :columns="columns"
            :pagination="{ rowsPerPage: 0 }"
            row-key="name"
            hide-header
            hide-pagination
          />
          <q-banner
            v-if="options.series.length === 0"
            class="text-white bg-info q-ma-md"
          >
            <translate>No information</translate>
          </q-banner>
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
import { PieChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS
} from 'config/app.conf'

echarts.use([PieChart, TooltipComponent, TitleComponent, SVGRenderer])

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
          text: this.title,
          show: false
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
      },
      viewData: false,
      dataGrid: [],
      columns: [
        {
          name: 'name',
          field: 'name',
          label: this.$gettext('Name'),
          align: 'left'
        },
        {
          name: 'value',
          field: 'value',
          label: this.$gettext('Value')
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

    groupBy(data, key) {
      return data.reduce(function(r, a) {
        r[a[key]] = r[a[key]] || []
        r[a[key]].push(a)
        return r
      }, {})
    },

    dataView() {
      this.viewData = true
      if (this.options.series.length === 2) {
        const keys = Object.keys(this.options.series[0].data[0])
        const groupByKey = keys.filter((x) => !['name', 'value'].includes(x))
        const groupByData = this.groupBy(
          this.options.series[1].data,
          groupByKey
        )

        this.dataGrid = []
        this.options.series[0].data.forEach((item) => {
          let data = []
          if (groupByKey[0] !== 'status_in') {
            data = groupByData[item[groupByKey]]
          } else {
            if (item[groupByKey].includes(',')) {
              item[groupByKey].split(',').forEach((key) => {
                if (groupByData[key]) data.push(groupByData[key][0])
              })
              if (data.length === 0) data = groupByData[item[groupByKey]]
            } else {
              data = groupByData[item[groupByKey]]
            }
          }
          this.dataGrid.push({
            title: `${item.name} (${item.value})`,
            data
          })
        })
      } else {
        this.dataGrid = [
          {
            title: `${this.data.title} (${this.data.total})`,
            data: this.data.data
          }
        ]
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
