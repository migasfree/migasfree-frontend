<template>
  <q-btn-group outlined rounded class="q-ml-lg">
    <q-input
      v-model="searchText"
      :label="$gettext('Search...')"
      dense
      borderless
      clearable
      :bg-color="$q.dark.isActive ? 'dark' : 'white'"
      @keydown.enter="search('computers-list')"
    />

    <q-btn-dropdown
      auto-close
      color="brown-1"
      text-color="blue-grey-8"
      rounded
      icon="mdi-magnify"
    >
      <q-list v-for="option in options" :key="option.to">
        <q-separator v-if="option.separatorBefore" />
        <q-item clickable @click="search(option.to)">
          <q-item-section v-if="option.icon" avatar>
            <q-icon :name="option.icon" size="sm" />
          </q-item-section>
          <q-item-section>{{ option.title }}</q-item-section>
        </q-item>
        <q-separator v-if="option.separatorAfter" />
      </q-list>
    </q-btn-dropdown>
  </q-btn-group>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'

import { modelIcon } from 'composables/element'

export default {
  name: 'SearchBox',
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const searchText = ref('')
    const options = reactive([
      {
        title: $gettext('Computers'),
        to: 'computers-list',
        icon: modelIcon('computers'),
        separatorAfter: true,
      },
      {
        title: $gettext('Deployments'),
        to: 'deployments-list',
        icon: modelIcon('deployments'),
      },
      {
        title: $gettext('Packages'),
        to: 'packages-list',
        icon: modelIcon('packages'),
      },
      {
        title: $gettext('Applications'),
        to: 'apps-list',
        icon: modelIcon('catalog/apps'),
        separatorAfter: true,
      },
      {
        title: $gettext('Devices'),
        to: 'devices-list',
        icon: modelIcon('devices/devices'),
      },
    ])

    const search = (urlName) => {
      router.push({
        name: urlName,
        query: { search: searchText.value },
      })
    }

    return { searchText, options, search }
  },
}
</script>
