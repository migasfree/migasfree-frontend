<template>
  <div>
    <q-card :bordered="!borderless">
      <q-card-section class="q-pb-none">
        <div class="row">
          <div class="col">
            <div class="text-h5 q-mt-sm">{{ title }}</div>
          </div>

          <div class="col-auto">
            <q-btn
              v-if="data.total"
              size="lg"
              padding="xs md"
              :disable="data.total <= 0"
              :color="critical && data.total > 0 ? 'negative' : 'secondary'"
              text-color="white"
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
        <BannerInfo
          v-if="noData && !loading"
          :message="$gettext('No data available.')"
        />
      </q-card-section>

      <q-card-actions v-show="isChartVisible" align="around" class="q-pt-none">
        <q-btn :icon="appIcon('data')" flat color="primary" @click="dataView">
          <q-tooltip>{{ $gettext('Data View') }}</q-tooltip>
        </q-btn>

        <q-btn-dropdown flat stretch color="primary">
          <template #label>
            <q-icon :name="appIcon('download')" />

            <q-tooltip>
              {{ $gettext('Save as Image') }}
            </q-tooltip>
          </template>

          <q-list>
            <q-item clickable @click="saveSvgImage">SVG</q-item>
            <q-item clickable @click="savePngImage">PNG</q-item>
          </q-list>
        </q-btn-dropdown>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="viewData">
      <q-card>
        <q-card-section>
          <div class="text-h5">
            <q-icon :name="appIcon('data')" size="lg" class="vertical-middle" />
            <span class="vertical-middle">{{ $gettext('Data') }}</span>
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
            @row-click="rowClick"
          >
            <template #top-right>
              <q-btn
                flat
                :icon="appIcon('export')"
                color="primary"
                @click.stop="exportTable(serie)"
                ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
              >
            </template>
          </q-table>
          <BannerInfo
            v-if="options.series.length === 0"
            :message="$gettext('No information')"
          />
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import VChart from 'vue-echarts'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { appIcon } from 'composables/element'
import { useChartExport } from 'composables/chart/export'
import { useChartOptions } from 'composables/chart/options'
import { useChartUtils } from 'composables/chart/utils'

import BannerInfo from 'components/ui/BannerInfo'

import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([PieChart, TooltipComponent, TitleComponent, SVGRenderer])

export default {
  name: 'PieChart',
  components: { BannerInfo, VChart },
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
    borderless: {
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

    const { initOptions, loadingOptions, getChartColors, getTextColor } =
      useChartOptions()
    const { groupBy } = useChartUtils(chart)
    const { saveSvgImage, savePngImage, exportTableToCsv } = useChartExport()

    const options = reactive({
      animation: false,
      textStyle: {
        fontFamily: 'Dosis',
        fontSize: 14,
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} ({c}): <strong>{d}%</strong>',
      },
      color: getChartColors(),
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
          color: getTextColor(),
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
          color: $q.dark.isActive ? 'black' : 'white',
          textBorderColor: $q.dark.isActive ? 'white' : 'black',
          textBorderWidth: 1,
        },
        labelLine: {
          show: false,
        },
        labelLayout: {
          hideOverlap: true,
        },
        data: [],
      },
      {
        type: 'pie',
        radius: ['40%', '55%'],
        label: {
          color: getTextColor(),
          formatter: '{b} ({c}): {per|{d}%}',
          rich: {
            per: {
              fontWeight: 'bold',
            },
          },
        },
        labelLayout: {
          hideOverlap: true,
        },
        data: [],
      },
    ]

    const loading = ref(false)
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
      return !('total' in data) || data.total === 0
    })

    onMounted(async () => {
      loading.value = true
      try {
        const response = await api.get(props.endPoint)

        options.series = 'inner' in response.data ? nestedSeries : normalSeries

        Object.assign(data, response.data)

        if ('inner' in data) {
          options.series[0].data = data.inner
          options.series[1].data = data.outer
        } else {
          options.series[0].data = data.data
        }
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    })

    const rowClick = (evt, row) => {
      const params = new Object()
      params.data = row
      passData(params)
    }

    const passData = (params) => {
      emit('get-link', Object.assign(params, { url: props.url }))
    }

    const goTo = () => {
      if (props.url) {
        router.push(props.url)
      }
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

    const exportTable = (serie) => {
      exportTableToCsv(`${serie.title}.csv`, columns, serie.itemData)
    }

    watch(
      () => $q.dark.isActive,
      (val) => {
        options.color = getChartColors()

        if ('series' in options) {
          options.series.map((item) => {
            if (item.label.position === 'inner') {
              item.label.color = val ? 'black' : 'white'
              item.label.textBorderColor = val ? 'white' : 'black'
            } else {
              item.label.color = getTextColor()
            }
          })
        }
      },
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
      saveSvgImage: () => saveSvgImage(chart.value, props.title),
      savePngImage: () => savePngImage(chart.value, props.title),
      dataView,
      exportTable,
      appIcon,
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
