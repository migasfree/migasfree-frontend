import { onBeforeMount, onBeforeUnmount } from 'vue'

export function useChartUtils(chartRef) {
  const windowResize = () => {
    if (chartRef.value !== null && chartRef.value !== undefined) {
      chartRef.value.resize()
    }
  }

  const groupBy = (data, key) => {
    return data.reduce((acc, item) => {
      acc[item[key]] = acc[item[key]] || []
      acc[item[key]].push(item)
      return acc
    }, {})
  }

  onBeforeMount(() => {
    window.addEventListener('resize', windowResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', windowResize)
  })

  return {
    windowResize,
    groupBy,
  }
}
