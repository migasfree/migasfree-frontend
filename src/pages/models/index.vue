<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="addRoutes" :has-export-button="false" />

    <SearchFilter v-model="searchText" @search="search" />

    <div class="row">
      <div class="col">
        <PieChart
          :title="$gettext('Models / Manufacturer')"
          end-point="/api/v1/token/stats/devices/models/manufacturer/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('Models / Project')"
          :initial-data="byProject"
          @get-link="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'
import StackedBarChart from 'components/chart/StackedBar'

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    PieChart,
    StackedBarChart,
  },
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()
    const uiStore = useUiStore()

    const title = ref($gettext('Models'))
    useMeta({ title: title.value })

    const searchText = ref('')
    const addRoutes = reactive([{ route: 'model-add' }])

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Devices'),
        icon: 'mdi-printer-eye',
      },
      {
        text: $gettext('Models'),
        icon: modelIcon('devices/models'),
      },
    ])

    const url = reactive({ name: 'models-list' })
    const byProject = reactive({})

    const goTo = (params) => {
      if (params.data.manufacturer_id) {
        router.push(
          Object.assign(url, {
            query: { manufacturer_id: params.data.manufacturer_id },
          })
        )
      }

      if (params.data.drivers__project__id) {
        router.push(
          Object.assign(url, {
            query: { drivers_project_id: params.data.drivers__project__id },
          })
        )
      }
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    onMounted(async () => {
      await api
        .get('/api/v1/token/stats/devices/models/project/')
        .then((response) => {
          byProject.xData = response.data.x_labels
          byProject.series = [
            {
              type: 'bar',
              data: response.data.data,
              name: $gettext('Models'),
              markLine: {
                data: [
                  {
                    label: { show: true },
                    name: $gettext('Total'),
                    yAxis: response.data.total,
                  },
                ],
              },
            },
          ]
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    })

    return {
      title,
      searchText,
      addRoutes,
      breadcrumbs,
      url,
      byProject,
      goTo,
      search,
    }
  },
}
</script>
