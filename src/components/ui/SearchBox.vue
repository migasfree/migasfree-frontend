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
      <q-list padding>
        <q-item clickable @click="search('computers-list')">
          <translate>Computers</translate>
        </q-item>
        <q-separator />

        <q-item clickable @click="search('desployments-list')">
          <translate>Deployments</translate>
        </q-item>
        <q-item clickable @click="search('packages-list')">
          <translate>Packages</translate>
        </q-item>
        <q-item clickable @click="search('applications-list')">
          <translate>Apps</translate>
        </q-item>
        <q-separator />

        <q-item clickable @click="search('devices-list')">
          <translate>Devices</translate>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </q-btn-group>
</template>

<script>
export default {
  name: 'SearchBox',
  data() {
    return {
      searchText: ''
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
