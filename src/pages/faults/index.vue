<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-pb-md">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Faults / Month')"
          end-point="/api/v1/token/stats/faults/project/month/"
          month-selector
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row q-pb-md">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Faults / Day')"
          end-point="/api/v1/token/stats/faults/project/day/"
          day-selector
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Faults / Faults Definitions')"
          end-point="/api/v1/token/stats/faults/definition/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-6 col-md">
        <PieChart
          :title="$gettext('Unchecked Faults')"
          end-point="/api/v1/token/stats/faults/unchecked/"
          :url="uncheckedFaultsUrl"
          :critical="true"
          @get-link="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'
import StackedBarChart from 'components/chart/StackedBar'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    SearchFilter,
    StackedBarChart,
    PieChart,
  },
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const titleIcon = modelIcon('faults')
    const title = $gettext('Faults')
    useMeta({ title })

    const searchText = ref('')

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: title,
        icon: titleIcon,
      },
    ])

    const url = { name: 'faults-list' }

    const uncheckedFaultsUrl = computed(() => {
      return Object.assign({}, url, { query: { checked: false } })
    })

    const goTo = (params) => {
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.project_id) {
          Object.assign(query, {
            project_id: params.data.project_id,
          })
        }

        if (params.data.platform_id) {
          Object.assign(query, {
            platform_id: params.data.platform_id,
          })
        }

        if (params.data.fault_definition_id) {
          Object.assign(query, {
            fault_definition_id: params.data.fault_definition_id,
          })
        }

        router.push({ name: params.url.name, query })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt,
        }

        if (params.data.project__id__exact) {
          Object.assign(query, { project_id: params.data.project__id__exact })
        }

        router.push(Object.assign({}, url, { query }))
      }
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    return {
      title,
      titleIcon,
      searchText,
      breadcrumbs,
      url,
      uncheckedFaultsUrl,
      goTo,
      search,
    }
  },
}
</script>
