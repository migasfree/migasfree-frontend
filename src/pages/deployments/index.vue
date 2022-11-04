<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-route="addRoute" :has-export-button="false" />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-col-gutter-md q-pb-md">
      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Enabled Deployments')"
          end-point="/api/v1/token/stats/deployments/enabled/project/"
          :url="enabledUrl"
          @get-link="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Deployments / Enabled')"
          end-point="/api/v1/token/stats/deployments/enabled/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Deployments / Schedule')"
          end-point="/api/v1/token/stats/deployments/schedule/"
          :url="url"
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
import _merge from 'lodash/merge'

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

    const title = ref($gettext('Deployments'))
    useMeta({ title: title.value })

    const searchText = ref('')
    const addRoute = 'deployment-add'

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
        text: $gettext('Deployments'),
        icon: modelIcon('deployments'),
      },
    ])

    const url = reactive({ name: 'deployments-list' })

    const enabledUrl = computed(() => {
      return Object.assign({}, url, {
        query: { enabled: true },
      })
    })

    const goTo = (params) => {
      let query = params.url.query || {}

      if (params.data.project_id) {
        query = _merge(query, { project_id: params.data.project_id })
      }

      if ('schedule' in params.data) {
        query = _merge(query, { schedule: params.data.schedule })
      }

      if (params.data.enabled) {
        query = _merge(query, { enabled: params.data.enabled })
      }

      router.push({
        name: url.name,
        query,
      })
    }

    const search = (value) => {
      router.push(Object.assign(url, { query: { search: value } }))
    }

    return {
      title,
      searchText,
      addRoute,
      breadcrumbs,
      url,
      enabledUrl,
      goTo,
      search,
    }
  },
}
</script>
