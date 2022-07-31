<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :is-export-btn="false" />

    <SearchFilter v-model="searchText" @search="search" />

    <div class="row">
      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="$gettext('Computers / Machine')"
          end-point="/api/v1/token/stats/computers/machine/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="$gettext('Subscribed Computers / Status')"
          end-point="/api/v1/token/stats/computers/status/"
          :url="statusUrl"
          @get-link="goTo"
        />
      </div>

      <div class="col-md-4 col-sm-12 col-xs-12">
        <PieChart
          :title="$gettext('Productive Computers')"
          end-point="/api/v1/token/stats/computers/productive/platform/"
          :url="productiveUrl"
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('New Computers / Month')"
          end-point="/api/v1/token/stats/computers/new/month/"
          @get-link="goTo"
        />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <StackedBarChart
          :title="$gettext('Physical computers entering the system per year')"
          end-point="/api/v1/token/stats/computers/entry/year/"
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

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    SearchFilter,
    PieChart,
    StackedBarChart,
  },
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const title = ref($gettext('Computers'))
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
        icon: modelIcon('computers'),
      },
    ])

    const url = reactive({ name: 'computers-list' })

    const statusUrl = computed(() => {
      return Object.assign({}, url, {
        query: { status_in: 'intended,reserved,unknown,in repair,available' },
      })
    })

    const productiveUrl = computed(() => {
      return Object.assign({}, url, {
        query: { status_in: 'intended,reserved,unknown' },
      })
    })

    const goTo = (params) => {
      let query = {}

      if ('url' in params && 'query' in params.url) query = params.url.query

      if (params.data.machine) {
        router.push({
          name: url.name,
          query: Object.assign(query, {
            machine: params.data.machine,
          }),
        })
      }

      if (params.data.status_in) {
        router.push({
          name: url.name,
          query: Object.assign(query, {
            status_in: params.data.status_in,
          }),
        })
      }

      if (params.data.project_id) {
        router.push({
          name: url.name,
          query: Object.assign(query, {
            project_id: params.data.project_id,
          }),
        })
      }

      if (params.data.platform_id) {
        router.push({
          name: url.name,
          query: Object.assign(query, {
            platform_id: params.data.platform_id,
          }),
        })
      }

      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt,
        }

        if (params.data.project__id__exact) {
          Object.assign(query, { project_id: params.data.project__id__exact })
        }
        if (params.data.machine) {
          Object.assign(query, { machine: params.data.machine })
        }

        router.push(Object.assign(url, { query }))
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
      statusUrl,
      productiveUrl,
      goTo,
      search,
    }
  },
}
</script>
