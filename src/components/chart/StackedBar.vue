<template>
  <div>
    <q-card :bordered="!borderless" flat>
      <q-card-section v-if="title && showTitle" class="q-pb-none">
        <div class="text-h5">{{ title }}</div>
      </q-card-section>

      <slot name="selector"></slot>

      <q-card-section
        v-if="monthSelector || daySelector"
        class="row justify-center q-py-none"
      >
        <MonthInput
          v-if="monthSelector"
          v-model="begin"
          class="q-ma-sm"
          :label="$gettext('Initial Month')"
        />

        <MonthInput
          v-if="monthSelector"
          v-model="end"
          class="q-ma-sm"
          :label="$gettext('Final Month')"
        />

        <DayInput
          v-if="daySelector"
          v-model="begin"
          class="q-ma-sm"
          :label="$gettext('Initial Day')"
        />

        <DayInput
          v-if="daySelector"
          v-model="end"
          class="q-ma-sm"
          :label="$gettext('Final Day')"
        />

        <q-btn
          :icon="appIcon('update')"
          class="q-ma-sm"
          :disabled="loading"
          :loading="loading"
          :label="$gettext('Update')"
          @click="loadData"
        />
      </q-card-section>

      <q-card-section class="echart-container q-py-none">
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

      <q-card-actions v-show="isChartVisible" align="around" class="q-pt-sm">
        <q-btn :icon="appIcon('data')" flat color="primary" @click="dataView">
          <q-tooltip>{{ $gettext('Data View') }}</q-tooltip>
        </q-btn>

        <q-btn-toggle
          v-if="isSelectedModeVisible"
          v-model="selectedMode"
          flat
          :options="[
            { slot: 'multiple', value: 'multiple' },
            { slot: 'single', value: 'single' },
          ]"
          @update:model-value="updateSelectedMode"
        >
          <template #multiple>
            <q-icon name="mdi-image-multiple" />
            <q-tooltip>{{ $gettext('Multiple Selection') }}</q-tooltip>
          </template>

          <template #single>
            <q-icon name="mdi-image" />
            <q-tooltip>{{ $gettext('Single Selection') }}</q-tooltip>
          </template>
        </q-btn-toggle>

        <q-btn
          :icon="appIcon('download')"
          flat
          color="primary"
          @click="saveImage"
        >
          <q-tooltip>{{ $gettext('Save as Image') }}</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="viewData">
      <q-card flat>
        <q-card-section>
          <div class="text-h5">
            <q-icon :name="appIcon('data')" size="lg" class="vertical-middle" />
            <span class="vertical-middle">{{ $gettext('Data') }}</span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-table
            v-if="isChartVisible"
            class="q-ma-md"
            :pagination="{ rowsPerPage: 0 }"
            :rows="data.series"
            hide-pagination
            flat
            bordered
          >
            <template #top-left>
              <q-btn
                flat
                :icon="appIcon('export')"
                color="primary"
                @click.stop="exportTable"
                ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
              >
            </template>

            <template #header>
              <q-tr>
                <q-th></q-th>
                <q-th v-for="(item, index) in data.xData" :key="index">{{
                  item
                }}</q-th>
              </q-tr>
            </template>

            <template #body="props">
              <q-tr :props="props">
                <q-th>{{ props.row.name }}</q-th>
                <q-td
                  v-for="(item, index) in props.row.data"
                  :key="index"
                  class="cursor-pointer"
                  @click="selectCell(props.row.data[index])"
                >
                  {{ item.value }}
                </q-td>
              </q-tr>
            </template>
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
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
} from 'vue'
import { exportFile, useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { appIcon } from 'composables/element'

import BannerInfo from 'components/ui/BannerInfo'
import DayInput from 'components/ui/DayInput'
import MonthInput from 'components/ui/MonthInput'

import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
} from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS,
} from 'config/app.conf'

echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
  SVGRenderer,
])

export default {
  name: 'StackedBarChart',
  components: { BannerInfo, DayInput, MonthInput },
  props: {
    title: {
      type: String,
      required: true,
    },
    showTitle: {
      type: Boolean,
      required: false,
      default: true,
    },
    endPoint: {
      type: String,
      required: false,
      default: '',
    },
    initialData: {
      type: Object,
      required: false,
      default() {
        return {}
      },
    },
    monthSelector: {
      type: Boolean,
      required: false,
      default: false,
    },
    daySelector: {
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
    const $q = useQuasar()
    const uiStore = useUiStore()

    const begin = ref('')
    const end = ref('')

    const selectedMode = ref('multiple')

    const chart = ref(null)
    const data = reactive(props.initialData)
    const options = reactive({
      animation: false,
      color: $q.dark.isActive
        ? MIGASFREE_CHART_DARK_COLORS
        : MIGASFREE_CHART_COLORS,
      textStyle: {
        fontFamily: 'Dosis',
        fontSize: 14,
      },
      tooltip: {
        show: true,
        trigger: 'axis',
      },
      legend: {
        type: 'scroll',
        show: true,
        bottom: 'bottom',
        textStyle: {
          color: $q.dark.isActive ? '#fff' : '#333',
        },
        pageTextStyle: {
          color: $q.dark.isActive ? '#fff' : '#333',
        },
        pageIconColor: $q.dark.isActive ? '#fff' : '#2f4554',
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLine: {
          lineStyle: {
            color: $q.dark.isActive ? '#fff' : '#333',
          },
        },
        axisLabel: {
          color: $q.dark.isActive ? '#fff' : '#333',
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: $q.dark.isActive ? '#fff' : '#333',
          },
        },
        axisLabel: {
          color: $q.dark.isActive ? '#fff' : '#333',
        },
      },
      series: [],
      title: {
        text: props.title,
        show: false,
      },
    })

    const initOptions = reactive({
      renderer: 'svg',
    })

    const loading = ref(false)
    const loadingOptions = reactive({
      showSpinner: true,
      text: $gettext('Loading data...'),
      color: '#39BEDA',
      textColor: $q.dark.isActive
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0, 0, 0, 0.5)',
      maskColor: $q.dark.isActive ? '#3A4149' : 'white',
      fontFamily: 'Dosis',
      fontSize: 14,
    })

    const viewData = ref(false)

    const isChartVisible = computed(() => {
      return (
        Object.keys(data).length > 0 ||
        ('series' in data && data.series.length > 0)
      )
    })

    const isSelectedModeVisible = computed(() => {
      return options.series.length > 1
    })

    const noData = computed(() => {
      return !('series' in data)
    })

    const loadData = async () => {
      if (!props.endPoint) return

      loading.value = true
      await api
        .get(props.endPoint, { params: { begin: begin.value, end: end.value } })
        .then((response) => {
          const series = []

          Object.entries(response.data.data).map(([key, val]) => {
            series.push({
              type: 'line',
              smooth: true,
              name: key,
              data: val,
            })
          })

          Object.assign(data, {
            xData: response.data.x_labels,
            series,
          })

          if ('series' in data) {
            options.series = data.series
          }
          if ('xData' in data) {
            options.xAxis.data = data.xData
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.value = false
        })
    }

    onMounted(async () => {
      await loadData()
    })

    onBeforeMount(() => {
      window.addEventListener('resize', windowResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', windowResize)
    })

    const selectCell = (data) => {
      const params = new Object()
      params.data = data
      passData(params)
    }

    const passData = (params) => {
      emit('get-link', params)
    }

    const windowResize = () => {
      if (chart.value !== null && chart.value !== undefined) {
        chart.value.resize()
      }
    }

    const updateSelectedMode = () => {
      options.legend.selectedMode = selectedMode
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

    const dataView = () => {
      viewData.value = true
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

    const exportTable = () => {
      // naive encoding to csv format
      const head = [
        wrapCsvValue(''),
        data.xData.map((col) => wrapCsvValue(col)),
      ].join(',')
      const body = data.series
        .map((row) => {
          return [
            wrapCsvValue(row.name),
            row.data
              .map((item) => {
                return wrapCsvValue(item.value)
              })
              .join(','),
          ].join(',')
        })
        .join('\r\n')

      const status = exportFile(
        `${props.title}.csv`,
        [head, body].join('\r\n'),
        'text/csv',
      )

      if (status !== true) {
        uiStore.notifyError($gettext('Browser denied file download...'))
      }
    }

    watch(
      () => props.initialData,
      (val) => {
        Object.assign(data, val)
        if ('series' in data) {
          options.series = data.series
        }
        if ('xData' in data) {
          options.xAxis.data = data.xData
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () => $q.dark.isActive,
      (val) => {
        options.color = val
          ? MIGASFREE_CHART_DARK_COLORS
          : MIGASFREE_CHART_COLORS
        options.legend.textStyle.color = val ? '#fff' : '#333'
        options.legend.pageTextStyle.color = val ? '#fff' : '#333'
        options.legend.pageIconColor = val ? '#fff' : '#2f4554'
        options.xAxis.axisLine.lineStyle.color = val ? '#fff' : '#333'
        options.xAxis.axisLabel.color = val ? '#fff' : '#333'
        options.yAxis.axisLine.lineStyle.color = val ? '#fff' : '#333'
        options.yAxis.axisLabel.color = val ? '#fff' : '#333'
        if (
          Array.isArray(options.series) &&
          options.series.length > 0 &&
          'markLine' in options.series[0]
        )
          options.series[0].markLine.label.color = val ? '#fff' : '#333'
      },
    )

    return {
      begin,
      end,
      selectedMode,
      chart,
      data,
      options,
      initOptions,
      loading,
      loadingOptions,
      viewData,
      isChartVisible,
      isSelectedModeVisible,
      noData,
      selectCell,
      passData,
      updateSelectedMode,
      saveImage,
      dataView,
      exportTable,
      loadData,
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
