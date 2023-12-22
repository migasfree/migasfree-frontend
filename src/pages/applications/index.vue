<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :icon="titleIcon"
      :has-export-button="false"
      :add-route="addRoute"
    />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-col-gutter-md q-pb-md">
      <div class="col-md-6 col-sm-6 col-xs-12">
        <PieChart
          :title="$gettext('Applications / Category')"
          end-point="/api/v1/token/stats/applications/category/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-md-6 col-sm-6 col-xs-12">
        <PieChart
          :title="$gettext('Applications / Level')"
          end-point="/api/v1/token/stats/applications/level/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('Applications / Project')"
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
import { useMeta, useQuasar } from 'quasar'
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
    const $q = useQuasar()
    const uiStore = useUiStore()

    const titleIcon = modelIcon('catalog/apps')
    const title = $gettext('Applications')
    useMeta({ title })

    const searchText = ref('')

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Release'),
        icon: appIcon('release'),
      },
      {
        text: title,
        icon: titleIcon,
      },
    ])

    const addRoute = 'app-add'
    const url = { name: 'apps-list' }
    const byProject = reactive({})

    const goTo = (params) => {
      if (params.data.category) {
        router.push(
          Object.assign(url, {
            query: { category: params.data.category },
          }),
        )
      }

      if (params.data.level) {
        router.push(
          Object.assign(url, {
            query: { level: params.data.level },
          }),
        )
      }

      if (params.data.packages_by_project__project__id) {
        router.push(
          Object.assign(url, {
            query: {
              packages_by_project_project_id:
                params.data.packages_by_project__project__id,
            },
          }),
        )
      }
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    onMounted(async () => {
      await api
        .get('/api/v1/token/stats/applications/project/')
        .then((response) => {
          byProject.xData = response.data.x_labels
          byProject.series = [
            {
              type: 'bar',
              data: response.data.data,
              name: $gettext('Applications'),
              markLine: {
                label: {
                  show: true,
                  formatter: '{b}: {c}',
                  color: $q.dark.isActive ? '#fff' : '#333',
                },
                data: [
                  {
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
      titleIcon,
      searchText,
      byProject,
      breadcrumbs,
      addRoute,
      url,
      goTo,
      search,
    }
  },
}
</script>
