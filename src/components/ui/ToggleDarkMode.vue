<template>
  <q-btn
    flat
    round
    :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
    @click="toggleDarkMode"
  >
    <q-tooltip>{{
      $q.dark.isActive
        ? $gettext('Switch to Light mode')
        : $gettext('Switch to Dark mode')
    }}</q-tooltip>
  </q-btn>
</template>

<script>
export default {
  name: 'ToggleDarkMode',
  methods: {
    toggleDarkMode() {
      this.$q.dark.toggle()
      this.$q.cookies.set('darkMode', this.$q.dark.isActive, { expires: '30d' })
    },
  },
}
</script>
