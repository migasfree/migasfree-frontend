<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-export-button="false" />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row">
      <div class="col-12">
        <PieChart
          :title="$gettext('Packages / Project')"
          end-point="/api/v1/token/stats/packages-history/project/"
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

import { appIcon, modelIcon } from 'composables/element'

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

    const title = ref($gettext('Packages History'))
    useMeta({ title: title.value })

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
        text: title.value,
        icon: modelIcon('packages-history'),
      },
    ])

    const url = { name: 'packages-history-list' }

    const goTo = (params) => {
      if ('url' in params) {
        let query = params.url.query || {}

        if (params.data.package_project_id) {
          Object.assign(query, {
            package_project_id: params.data.package_project_id,
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
      breadcrumbs,
      url,
      goTo,
      search,
    }
  },
}
</script>
