<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :icon="titleIcon"
      :add-route="addRoute"
      :has-export-button="false"
    />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-pb-md">
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

import { appIcon, modelIcon } from 'composables/element'

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

    const titleIcon = modelIcon('devices/models')
    const title = $gettext('Models')
    useMeta({ title })

    const searchText = ref('')
    const addRoute = 'model-add'

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
      },
      {
        text: title,
        icon: titleIcon,
      },
    ])

    const url = { name: 'models-list' }
    const byProject = reactive({})

    const goTo = (params) => {
      if (params.data.manufacturer_id) {
        router.push(
          Object.assign(url, {
            query: { manufacturer_id: params.data.manufacturer_id },
          }),
        )
      }

      if (params.data.drivers__project__id) {
        router.push(
          Object.assign(url, {
            query: { drivers_project_id: params.data.drivers__project__id },
          }),
        )
      }
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    onMounted(async () => {
      try {
        const { data } = await api.get(
          '/api/v1/token/stats/devices/models/project/',
        )
        byProject.xData = data.x_labels
        byProject.series = [
          {
            type: 'bar',
            data: data.data,
            name: $gettext('Models'),
            markLine: {
              data: [
                {
                  label: { show: true },
                  name: $gettext('Total'),
                  yAxis: data.total,
                },
              ],
            },
          },
        ]
      } catch (error) {
        uiStore.notifyError(error)
      }
    })

    return {
      title,
      titleIcon,
      searchText,
      addRoute,
      breadcrumbs,
      url,
      byProject,
      goTo,
      search,
    }
  },
}
</script>
