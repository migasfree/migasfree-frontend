<template>
  <q-btn-group
    outlined
    class="q-ml-lg overflow-hidden self-center search-btn-group"
  >
    <q-input
      v-model="searchText"
      :label="$gettext('Search...')"
      square
      borderless
      dense
      clearable
      :bg-color="$q.dark.isActive ? 'dark' : 'white'"
      @keydown.enter="search({ to: selectedRoute, icon: selectedIcon })"
    />

    <q-btn-dropdown auto-close color="brown-1" text-color="blue-grey-8" dense>
      <template #label>
        <q-icon :name="appIcon('search')" />
        <q-icon :name="selectedIcon" />
      </template>

      <q-list role="menu">
        <template v-for="option in options" :key="option.to">
          <q-item v-if="option.separatorBefore" role="separator" />
          <q-item clickable role="menuitem" @click="search(option)">
            <q-item-section v-if="option.icon" avatar>
              <q-icon :name="option.icon" size="sm" />
            </q-item-section>
            <q-item-section>{{ option.title }}</q-item-section>
          </q-item>
          <q-separator v-if="option.separatorAfter" />
        </template>
      </q-list>
    </q-btn-dropdown>
  </q-btn-group>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'

import { appIcon, modelIcon } from 'composables/element'

export default {
  name: 'SearchBox',
  setup() {
    const router = useRouter()
    const { $gettext } = useGettext()

    const searchText = ref('')
    const selectedIcon = ref(modelIcon('computers'))
    const selectedRoute = ref('computers-list')
    const options = [
      {
        title: $gettext('Computers'),
        to: 'computers-list',
        icon: modelIcon('computers'),
      },
      {
        title: $gettext('Attributes'),
        to: 'features-list',
        icon: modelIcon('attributes'),
      },
      {
        title: $gettext('Tags'),
        to: 'tags-list',
        icon: modelIcon('tags'),
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
    ]

    const search = (item) => {
      selectedIcon.value = item.icon
      selectedRoute.value = item.to

      router.push({
        name: item.to,
        query: { search: searchText.value },
      })
    }

    return { searchText, options, search, selectedIcon, selectedRoute, appIcon }
  },
}
</script>

<style scoped>
.search-btn-group {
  border-radius: 0 24px 24px 0;
}
</style>
