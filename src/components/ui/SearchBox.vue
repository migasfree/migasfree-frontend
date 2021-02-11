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
export default {
  name: 'SearchBox',
  data() {
    return {
      searchText: '',
      options: [
        {
          title: this.$gettext('Computers'),
          to: 'computers-list',
          icon: 'mdi-desktop-classic',
          separatorAfter: true
        },
        {
          title: this.$gettext('Deployments'),
          to: 'deployments-list',
          icon: 'mdi-rocket-launch'
        },
        {
          title: this.$gettext('Packages'),
          to: 'packages-list',
          icon: 'mdi-package-variant'
        },
        {
          title: this.$gettext('Applications'),
          to: 'apps-list',
          icon: 'mdi-apps',
          separatorAfter: true
        },
        {
          title: this.$gettext('Devices'),
          to: 'devices-list',
          icon: 'mdi-printer'
        }
      ]
    }
  },
  methods: {
    search(urlName) {
      this.$router.push({
        name: urlName,
        query: { search: this.searchText }
      })
    }
  }
}
</script>
