<template>
  <q-btn
    v-if="$q.screen.gt.sm"
    round
    flat
    :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
    :aria-label="
      $q.fullscreen.isActive
        ? $gettext('Switch to Regular Screen view')
        : $gettext('Switch to Full Screen view')
    "
    @click="$q.fullscreen.toggle()"
  >
    <q-tooltip>{{
      $q.fullscreen.isActive
        ? $gettext('Switch to Regular Screen view')
        : $gettext('Switch to Full Screen view')
    }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

const $q = useQuasar()
const { $gettext } = useGettext()
</script>
