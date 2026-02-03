<template>
  <div>
    <q-card :bordered="!borderless">
      <q-card-section v-if="title && showTitle" class="q-pb-none">
        <div class="text-h5 q-mt-sm">{{ title }}</div>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { exportFile, useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import VChart from 'vue-echarts'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { appIcon } from 'composables/element'
import { useChartExport } from 'composables/chart/export'
import { useChartOptions } from 'composables/chart/options'
import { useChartUtils } from 'composables/chart/utils'

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
  components: { BannerInfo, DayInput, MonthInput, VChart },
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

    const { initOptions, loadingOptions, getChartColors, getTextColor } =
      useChartOptions()
    useChartUtils(chart)
    const { saveSvgImage, savePngImage, wrapCsvValue } = useChartExport()

    const options = reactive({
      animation: false,
      color: getChartColors(),
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
          color: getTextColor(),
        },
        pageTextStyle: {
          color: getTextColor(),
        },
        pageIconColor: $q.dark.isActive ? '#fff' : '#2f4554',
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLine: {
          lineStyle: {
            color: getTextColor(),
          },
        },
        axisLabel: {
          color: getTextColor(),
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: getTextColor(),
          },
        },
        axisLabel: {
          color: getTextColor(),
        },
      },
      series: [],
      title: {
        text: props.title,
        show: false,
      },
    })

    const loading = ref(false)
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
      try {
        const { data: resp } = await api.get(props.endPoint, {
          params: { begin: begin.value, end: end.value },
        })

        const series = Object.entries(resp.data).reduce((acc, [key, val]) => {
          acc.push({
            type: 'line',
            smooth: true,
            name: key,
            data: val,
          })
          return acc
        }, [])

        Object.assign(data, {
          xData: resp.x_labels,
          series,
        })

        if ('series' in data) {
          options.series = data.series
        }
        if ('xData' in data) {
          options.xAxis.data = data.xData
        }
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await loadData()
    })

    const selectCell = (data) => {
      const params = new Object()
      params.data = data
      passData(params)
    }

    const passData = (params) => {
      emit('get-link', params)
    }

    const updateSelectedMode = () => {
      options.legend.selectedMode = selectedMode
    }

    const dataView = () => {
      viewData.value = true
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
        options.color = getChartColors()
        options.legend.textStyle.color = getTextColor()
        options.legend.pageTextStyle.color = getTextColor()
        options.legend.pageIconColor = val ? '#fff' : '#2f4554'
        options.xAxis.axisLine.lineStyle.color = getTextColor()
        options.xAxis.axisLabel.color = getTextColor()
        options.yAxis.axisLine.lineStyle.color = getTextColor()
        options.yAxis.axisLabel.color = getTextColor()
        if (
          Array.isArray(options.series) &&
          options.series.length > 0 &&
          'markLine' in options.series[0]
        )
          options.series[0].markLine.label.color = getTextColor()
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
      saveSvgImage: () => saveSvgImage(chart.value, props.title),
      savePngImage: () => savePngImage(chart.value, props.title),
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
