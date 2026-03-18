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
        :icon-right="modelIcon('devices/drivers')"
        @click="
          $router.push({
            name: 'driver-add',
            query: { capability: element.id },
          })
        "
        ><q-tooltip>{{ $gettext('Add Driver') }}</q-tooltip></q-btn
      >

      <q-btn
        color="secondary"
        class="q-ma-sm"
        :icon="appIcon('add')"
        :icon-right="modelIcon('devices/logical')"
        @click="
          $router.push({
            name: 'logical-device-add',
            query: { capability: element.id },
          })
        "
        ><q-tooltip>{{ $gettext('Add Logical Device') }}</q-tooltip></q-btn
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

const title = $gettext('Capability')
const model = 'devices/capabilities'
const routes = {
  list: 'capabilities-list',
  add: 'capability-add',
  detail: 'capability-detail',
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
    text: $gettext('Capabilities'),
    icon: modelIcon(model),
    to: routes.list,
  },
])
</script>
