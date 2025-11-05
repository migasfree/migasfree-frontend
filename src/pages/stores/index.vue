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

    <div class="row">
      <div class="col">
        <PieChart
          :title="$gettext('Stores / Project')"
          end-point="/api/v1/token/stats/stores/project/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
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
    SearchFilter,
    Header,
    PieChart,
  },
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const titleIcon = modelIcon('stores')
    const title = $gettext('Stores')
    useMeta({ title })

    const searchText = ref('')
    const addRoute = 'store-add'

    const breadcrumbs = ref([
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

    const url = { name: 'stores-list' }

    const goTo = (params) => {
      if (params.data.project_id) {
        router.push(
          Object.assign(url, {
            query: { project_id: params.data.project_id },
          }),
        )
      }
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    return {
      title,
      titleIcon,
      searchText,
      addRoute,
      breadcrumbs,
      url,
      goTo,
      search,
    }
  },
}
</script>
