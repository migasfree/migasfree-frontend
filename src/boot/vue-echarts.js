import VueECharts from 'vue-echarts'

export default async ({ app }) => {
  app.component('VChart', VueECharts)
}
