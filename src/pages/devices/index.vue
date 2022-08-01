<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-routes="addRoutes" :is-export-btn="false" />

    <SearchFilter v-model="searchText" @search="search" />

    <div class="row">
      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Devices / Connection')"
          end-point="/api/v1/token/stats/devices/connection/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Devices / Model')"
          end-point="/api/v1/token/stats/devices/model/"
          :url="url"
          @get-link="goTo"
        />
      </div>

      <div class="col-4 col-md">
        <PieChart
          :title="$gettext('Devices / Manufacturer')"
          end-point="/api/v1/token/stats/devices/manufacturer/"
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

    const title = ref($gettext('Devices'))
    useMeta({ title: title.value })

    const searchText = ref('')
    const addRoutes = reactive([{ route: 'device-add' }])

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Devices'),
        icon: 'mdi-printer-eye',
      },
      {
        text: $gettext('Devices'),
        icon: modelIcon('devices/devices'),
      },
    ])

    const url = reactive({ name: 'devices-list' })

    const goTo = (params) => {
      if (params.data.connection_id) {
        router.push(
          Object.assign(url, {
            query: { connection_id: params.data.connection_id },
          })
        )
      }

      if (params.data.model_id) {
        router.push(
          Object.assign(url, {
            query: { model_id: params.data.model_id },
          })
        )
      }

      if (params.data.manufacturer_id) {
        router.push(
          Object.assign(url, {
            query: { manufacturer_id: params.data.manufacturer_id },
          })
        )
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
