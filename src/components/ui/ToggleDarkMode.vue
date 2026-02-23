<template>
  <q-btn
    flat
    round
    :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
    :aria-label="
      $q.dark.isActive
        ? $gettext('Switch to Light mode')
        : $gettext('Switch to Dark mode')
    "
    @click="toggleDarkMode"
  >
    <q-tooltip>{{
      $q.dark.isActive
        ? $gettext('Switch to Light mode')
        : $gettext('Switch to Dark mode')
    }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

const toggleDarkMode = () => {
  $q.dark.toggle()

  const isDark = $q.dark.isActive

  $q.cookies.set('darkMode', isDark, { expires: '30d' })

  const theme = isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  document.body.setAttribute('data-theme', theme)

  window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }))
}
</script>
