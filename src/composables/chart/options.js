import { reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import {
  MIGASFREE_CHART_COLORS,
  MIGASFREE_CHART_DARK_COLORS,
} from 'config/app.conf'

export function useChartOptions() {
  const { $gettext } = useGettext()
  const $q = useQuasar()

  const initOptions = reactive({
    renderer: 'svg',
  })

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

  const getChartColors = () => {
    return $q.dark.isActive
      ? MIGASFREE_CHART_DARK_COLORS
      : MIGASFREE_CHART_COLORS
  }

  const getTextColor = () => {
    return $q.dark.isActive ? '#fff' : '#333'
  }

  watch(
    () => $q.dark.isActive,
    (val) => {
      loadingOptions.textColor = val
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0, 0, 0, 0.5)'
      loadingOptions.maskColor = val ? '#3A4149' : 'white'
    },
  )

  return {
    initOptions,
    loadingOptions,
    getChartColors,
    getTextColor,
  }
}
