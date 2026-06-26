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

    <div class="row q-col-gutter-md q-pb-md">
      <div class="col-12 col-md-6">
        <PieChart
          :title="$gettext('Configurations / Build Type')"
          end-point="/api/v1/token/stats/mgi/build-types/"
          :url="url"
          @get-link="goTo"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'
import _merge from 'lodash/merge'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import PieChart from 'components/chart/Pie'

import { appIcon, modelIcon } from 'composables/element'

const router = useRouter()
const { $gettext } = useGettext()

const titleIcon = modelIcon('mgi/config')
const title = $gettext('Configurations')
useMeta({ title })

const searchText = ref('')
const addRoute = 'config-add'

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Golden Images'),
    icon: appIcon('golden-images'),
  },
  {
    text: title,
    icon: titleIcon,
  },
])

const url = { name: 'configs-list' }

const goTo = (params) => {
  let query = params.url.query || {}

  if (params.data.project_id) {
    query = _merge(query, { project_id: params.data.project_id })
  }

  if (params.data.build_type) {
    query = _merge(query, { build_type: params.data.build_type })
  }

  router.push({
    name: url.name,
    query,
  })
}

const search = (value) => {
  router.push(Object.assign({}, url, { query: { search: value } }))
}
</script>
