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
import { useQuasar } from 'quasar'

export default {
  name: 'ToggleDarkMode',
  setup() {
    const $q = useQuasar()

    const toggleDarkMode = () => {
      $q.dark.toggle()
      $q.cookies.set('darkMode', $q.dark.isActive, { expires: '30d' })
    }

    return { toggleDarkMode }
  },
}
</script>
