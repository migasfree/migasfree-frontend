<template>
  <DetailViewTemplate
    :title="title"
    :model="model"
    :routes="routes"
    :breadcrumbs="breadcrumbs"
  >
    <template #actions="{ element }">
      <q-btn
        color="secondary"
        class="q-ma-sm"
        :icon="appIcon('add')"
        :icon-right="modelIcon('devices/models')"
        @click="
          $router.push({
            name: 'model-add',
            query: { manufacturer: element.id },
          })
        "
        ><q-tooltip>{{ $gettext('Add Model') }}</q-tooltip></q-btn
      >
    </template>
  </DetailViewTemplate>
</template>

<script setup>
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'

import DetailViewTemplate from 'components/ui/DetailViewTemplate'

import { appIcon, modelIcon } from 'composables/element'

const { $gettext } = useGettext()

const title = $gettext('Manufacturer')
const model = 'devices/manufacturers'
const routes = {
  list: 'manufacturers-list',
  add: 'manufacturer-add',
  detail: 'manufacturer-detail',
}

const breadcrumbs = ref([
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
    text: $gettext('Manufacturers'),
    icon: modelIcon(model),
    to: routes.list,
  },
])
</script>
