<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :add-route="addRoute" :has-export-button="false" />

    <SearchFilter v-model="searchText" class="q-pb-md" @search="search" />

    <div class="row q-col-gutter-md q-pb-md">
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

    const title = ref($gettext('Devices'))
    useMeta({ title: title.value })

    const searchText = ref('')
    const addRoute = 'device-add'

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Devices'),
        icon: appIcon('devices'),
      },
      {
        text: $gettext('Devices'),
        icon: modelIcon('devices/devices'),
      },
    ])

    const url = { name: 'devices-list' }

    const goTo = (params) => {
      if (params.data.connection_id) {
        router.push(
          Object.assign(url, {
            query: { connection_id: params.data.connection_id },
          }),
        )
      }

      if (params.data.model_id) {
        router.push(
          Object.assign(url, {
            query: { model_id: params.data.model_id },
          }),
        )
      }

      if (params.data.manufacturer_id) {
        router.push(
          Object.assign(url, {
            query: { manufacturer_id: params.data.manufacturer_id },
          }),
        )
      }
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
      goTo,
      search,
    }
  },
}
</script>
