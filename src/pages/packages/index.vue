<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="addRoutes" :is-export-btn="false" />

    <SearchFilter v-model="searchText" @search="search" />

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Packages / Store')"
          end-point="/api/v1/token/stats/packages/store/"
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

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    SearchFilter,
    PieChart,
  },
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const title = ref($gettext('Packages'))
    useMeta({ title: title.value })

    const searchText = ref('')
    const addRoutes = reactive([{ route: 'package-add' }])

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Release'),
        icon: 'mdi-truck-delivery',
      },
      {
        text: $gettext('Packages'),
        icon: modelIcon('packages'),
      },
    ])

    const url = reactive({ name: 'packages-list' })

    const goTo = (params) => {
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.project_id) {
          Object.assign(query, {
            project_id: params.data.project_id,
          })
        }

        if (params.data.store_id) {
          Object.assign(query, {
            store_id: params.data.store_id,
          })
        }

        router.push({ name: params.url.name, query })
      }
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    return {
      title,
      searchText,
      addRoutes,
      breadcrumbs,
      url,
      goTo,
      search,
    }
  },
}
</script>
