import { computed, ref, watch } from 'vue'
import { useChartOptions } from 'composables/chart/options'

export function usePieChart(titleProps, chartRef, isDark) {
  const { initOptions, loadingOptions, getChartColors, getTextColor } =
    useChartOptions()

  const borderColor = computed(() => (isDark.value ? '#1a1210' : '#fff'))

  const tooltipStyle = computed(() => ({
    backgroundColor: isDark.value
      ? 'rgba(26, 18, 16, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark.value ? '#431407' : '#e5e7eb',
    textStyle: { color: isDark.value ? '#fefce8' : '#1f2937' },
  }))

  const buildNormalSeries = () => [
    {
      type: 'pie',
      radius: ['60%', '85%'],
      center: ['50%', '50%'],
      data: [],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 5,
        borderColor: borderColor.value,
        borderWidth: 2,
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: { show: false },
    },
  ]

  const buildNestedSeries = () => [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: ['30%', '45%'],
      center: ['50%', '50%'],
      label: {
        position: 'inner',
        fontSize: 10,
        color: isDark.value ? 'black' : 'white',
        textBorderColor: isDark.value ? 'white' : 'black',
        textBorderWidth: 1,
        show: false,
      },
      labelLine: { show: false },
      labelLayout: { hideOverlap: true },
      itemStyle: {
        borderRadius: 2,
        borderColor: borderColor.value,
        borderWidth: 1,
      },
      data: [],
    },
    {
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '50%'],
      label: { show: false },
      labelLayout: { hideOverlap: true },
      itemStyle: {
        borderRadius: 4,
        borderColor: borderColor.value,
        borderWidth: 2,
      },
      data: [],
    },
  ]

  const options = ref({
    animation: false,
    textStyle: { fontFamily: 'Dosis', fontSize: 14 },
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b} ({c}): <strong>{d}%</strong>',
      ...tooltipStyle.value,
    },
    color: getChartColors(),
    series: [],
    title: { text: titleProps, show: false },
    legend: { show: false },
  })

  // Watch for theme changes
  watch(isDark, (val) => {
    options.value.color = getChartColors()
    Object.assign(options.value.tooltip, tooltipStyle.value)

    for (const serie of options.value.series) {
      if (serie.itemStyle) {
        serie.itemStyle.borderColor = val ? '#1a1210' : '#fff'
      }
      if (serie.label?.position === 'inner') {
        serie.label.color = val ? 'black' : 'white'
        serie.label.textBorderColor = val ? 'white' : 'black'
      } else if (serie.label) {
        serie.label.color = getTextColor()
      }
    }
  })

  const dispatchChartAction = (type, payload) => {
    if (!chartRef.value) return
    chartRef.value.dispatchAction({ type, ...payload })
  }

  return {
    initOptions,
    loadingOptions,
    options,
    buildNormalSeries,
    buildNestedSeries,
    getChartColors,
    dispatchChartAction,
  }
}
