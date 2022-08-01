<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :is-export-btn="false" />

    <SearchFilter v-model="searchText" @search="search" />

    <div class="row">
      <div class="col-12">
        <StackedBarChart
          :title="$gettext('Notifications / Month')"
          end-point="/api/v1/token/stats/notifications/month/"
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
import StackedBarChart from 'components/chart/StackedBar'

import { modelIcon } from 'composables/element'

export default {
  components: {
    Breadcrumbs,
    Header,
    SearchFilter,
    StackedBarChart,
  },
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const title = ref($gettext('Notifications'))
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
        icon: modelIcon('notifications'),
      },
    ])

    const url = reactive({ name: 'notifications-list' })

    const goTo = (params) => {
      if (params.data.created_at__lt) {
        let query = {
          created_at__gte: params.data.created_at__gte,
          created_at__lt: params.data.created_at__lt,
        }

        if ('checked__exact' in params.data) {
          Object.assign(query, {
            checked: params.data.checked__exact === 1 ? 'true' : 'false',
          })
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
