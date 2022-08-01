<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :is-export-btn="false" />

    <SearchFilter v-model="searchText" @search="search" />

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Migrations / Month')"
          end-point="/api/v1/token/stats/migrations/project/month/"
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Migrations / Project')"
          end-point="/api/v1/token/stats/migrations/project/"
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

import { modelIcon } from 'composables/element'

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

    const title = ref($gettext('Migrations'))
    useMeta({ title: title.value })

    const searchText = ref('')

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: title.value,
        icon: modelIcon('migrations'),
      },
    ])

    const url = reactive({ name: 'migrations-list' })

    const goTo = (params) => {
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.project_id) {
          Object.assign(query, {
            project_id: params.data.project_id,
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
      searchText,
      breadcrumbs,
      url,
      goTo,
      search,
    }
  },
}
</script>
