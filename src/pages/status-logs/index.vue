<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-pb-md">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Status Logs / Month')"
          end-point="/api/v1/token/stats/status-logs/month/"
          month-selector
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Status Logs / Status')"
          end-point="/api/v1/token/stats/status-logs/status/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, reactive } from 'vue'
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

    const titleIcon = modelIcon('status-logs')
    const title = $gettext('Status Logs')
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

    const url = { name: 'status-logs-list' }

    const goTo = (params) => {
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.status) {
          Object.assign(query, {
            status_in: params.data.status,
          })
        }

        if (
          !('query' in params.url) &&
          params.data.status_in &&
          !('status' in params.data)
        ) {
          Object.assign(query, {
            status_in: params.data.status_in,
          })
        }

        router.push({ name: params.url.name, query })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt,
          status_in: params.data.status__in,
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
      goTo,
      search,
    }
  },
}
</script>
