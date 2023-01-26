<template>
  <div>
    <q-card flat bordered>
      <q-card-section class="q-pb-none">
        <div class="row">
          <div class="col">
            <div class="text-h5 q-mt-sm">{{ title }}</div>
          </div>

          <div class="col-auto">
            <q-btn
              size="lg"
              padding="xs md"
              :disable="data.total <= 0"
              :color="critical ? 'negative' : 'info'"
              :text-color="critical ? 'white' : 'black'"
              :label="data.total"
              @click="goTo"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="echart-container q-pa-none">
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
        <q-banner v-if="noData" rounded class="bg-warning text-black q-ma-md">
          <translate>No data available.</translate>
        </q-banner>
      </q-card-section>

      <q-card-actions v-show="isChartVisible" align="around" class="q-pt-none">
        <q-btn
          icon="mdi-database-search"
          flat
          color="primary"
          @click="dataView"
        >
          <q-tooltip>{{ $gettext('Data View') }}</q-tooltip>
        </q-btn>

        <q-btn icon="mdi-download" flat color="primary" @click="saveImage">
          <q-tooltip>{{ $gettext('Save as Image') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="viewData">
      <q-card flat>
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
            :rows="serie.itemData"
            :columns="columns"
            :pagination="{ rowsPerPage: 0 }"
            row-key="name"
            hide-header
            hide-pagination
            flat
            bordered
            @row-click="rowClick"
          >
            <template #top-right>
              <q-btn
                flat
                icon="mdi-file-export"
                color="primary"
                @click.stop="exportTable(serie)"
                ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
              >
            </template>
          </q-table>
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
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
} from 'vue'
import { useRouter } from 'vue-router'
import { exportFile, useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS,
} from 'config/app.conf'

echarts.use([PieChart, TooltipComponent, TitleComponent, SVGRenderer])

export default {
  name: 'PieChart',
  props: {
    title: { type: String, required: true },
    endPoint: {
      type: String,
      required: true,
    },
    url: {
      type: Object,
      required: false,
      default() {
        return {}
      },
    },
    critical: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['get-link'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const router = useRouter()
    const $q = useQuasar()
    const uiStore = useUiStore()

    const chart = ref(null)
    const data = reactive({})
    const initOptions = reactive({
      renderer: 'svg',
    })

    const options = reactive({
      animation: false,
      tooltip: {
        trigger: 'item',
        formatter: '{b} ({c}): <strong>{d}%</strong>',
      },
      color: $q.dark.isActive
        ? MIGASFREE_CHART_DARK_COLORS
        : MIGASFREE_CHART_COLORS,
      series: [],
      title: {
        text: props.title,
        show: false,
      },
    })

    const normalSeries = [
      {
        type: 'pie',
        radius: ['30%', '65%'],
        center: ['50%', '60%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          color: $q.dark.isActive ? 'white' : 'black',
        },
      },
    ]

    const nestedSeries = [
      {
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '30%'],
        label: {
          position: 'inner',
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
      {
        type: 'pie',
        radius: ['40%', '55%'],
        label: {
          color: $q.dark.isActive ? 'white' : 'black',
          formatter: '{b} ({c}): {per|{d}%}',
          rich: {
            per: {
              fontWeight: 'bold',
            },
          },
        },
        data: [],
      },
    ]

    const loading = ref(false)
    const loadingOptions = reactive({
      showSpinner: true,
      text: $gettext('Loading data...'),
      color: '#39BEDA',
      textColor: $q.dark.isActive
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0, 0, 0, 0.5)',
      maskColor: $q.dark.isActive ? '#3A4149' : 'white',
    })

    const viewData = ref(false)
    const dataGrid = ref([])

    const columns = reactive([
      {
        name: 'name',
        field: 'name',
        label: $gettext('Name'),
        align: 'left',
      },
      {
        name: 'value',
        field: 'value',
        label: $gettext('Value'),
      },
    ])

    const isChartVisible = computed(() => {
      return Object.keys(data).length === 0 || data.total > 0
    })

    const noData = computed(() => {
      return !'total' in data || data.total === 0
    })

    onMounted(async () => {
      loading.value = true
      await api
        .get(props.endPoint)
        .then((response) => {
          if ('inner' in response.data) {
            options.series = nestedSeries
          } else {
            options.series = normalSeries
          }

          Object.assign(data, response.data)

          if ('inner' in data) {
            options.series[0].data = data.inner
            options.series[1].data = data.outer
          } else {
            options.series[0].data = data.data
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.value = false
        })
    })

    onBeforeMount(() => {
      window.addEventListener('resize', windowResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', windowResize)
    })

    const rowClick = (evt, row, index) => {
      const params = new Object()
      params.data = row
      passData(params)
    }

    const passData = (params) => {
      emit('get-link', Object.assign(params, { url: props.url }))
    }

    const windowResize = () => {
      if (chart.value !== null && chart.value !== undefined) {
        chart.value.resize()
      }
    }

    const goTo = () => {
      if (props.url) {
        router.push(props.url)
      }
    }

    const saveImage = () => {
      const linkSource = chart.value.getDataURL()
      const downloadLink = document.createElement('a')

      document.body.appendChild(downloadLink)
      downloadLink.href = linkSource
      downloadLink.target = '_self'
      downloadLink.download = `${props.title}.svg`
      downloadLink.click()
    }

    const groupBy = (data, key) => {
      return data.reduce(function (r, a) {
        r[a[key]] = r[a[key]] || []
        r[a[key]].push(a)
        return r
      }, {})
    }

    const dataView = () => {
      viewData.value = true
      if (options.series.length === 2) {
        const keys = Object.keys(options.series[0].data[0])
        const groupByKey = keys.filter((x) => !['name', 'value'].includes(x))
        const groupByData = groupBy(options.series[1].data, groupByKey)

        dataGrid.value = []
        options.series[0].data.forEach((item) => {
          let itemData = []
          if (groupByKey[0] !== 'status_in') {
            itemData = groupByData[item[groupByKey]]
          } else {
            if (item[groupByKey].includes(',')) {
              item[groupByKey].split(',').forEach((key) => {
                if (groupByData[key]) itemData.push(groupByData[key][0])
              })
              if (itemData.length === 0)
                itemData = groupByData[item[groupByKey]]
            } else {
              itemData = groupByData[item[groupByKey]]
            }
          }
          dataGrid.value.push({
            title: `${item.name} (${item.value})`,
            itemData,
          })
        })
      } else {
        dataGrid.value = [
          {
            title: `${data.title} (${data.total})`,
            itemData: data.data,
          },
        ]
      }
    }

    const wrapCsvValue = (val, formatFn, row) => {
      let formatted = formatFn !== void 0 ? formatFn(val, row) : val

      formatted =
        formatted === void 0 || formatted === null ? '' : String(formatted)

      formatted = formatted.split('"').join('""')
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`
    }

    const exportTable = (serie) => {
      // naive encoding to csv format
      const content = [columns.map((col) => wrapCsvValue(col.label))]
        .concat(
          serie.itemData.map((row) =>
            columns
              .map((col) =>
                wrapCsvValue(
                  typeof col.field === 'function'
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                  col.format,
                  row
                )
              )
              .join(',')
          )
        )
        .join('\r\n')

      const status = exportFile(`${serie.title}.csv`, content, 'text/csv')

      if (status !== true) {
        uiStore.notifyError($gettext('Browser denied file download...'))
      }
    }

    watch(
      () => $q.dark.isActive,
      (val) => {
        options.color = val
          ? MIGASFREE_CHART_DARK_COLORS
          : MIGASFREE_CHART_COLORS

        if ('series' in options) {
          options.series.map((item) => {
            item.label.color = val ? 'white' : 'black'
          })
        }
      }
    )

    return {
      chart,
      data,
      initOptions,
      options,
      loading,
      loadingOptions,
      viewData,
      dataGrid,
      columns,
      isChartVisible,
      noData,
      rowClick,
      passData,
      goTo,
      saveImage,
      dataView,
      exportTable,
    }
  },
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
