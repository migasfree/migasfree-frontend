<template>
  <q-btn
    v-if="$q.screen.gt.sm"
    round
    flat
    :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
    @click="$q.fullscreen.toggle()"
  >
    <q-tooltip>{{
      $q.fullscreen.isActive
        ? $gettext('Switch to Regular Screen view')
        : $gettext('Switch to Full Screen view')
    }}</q-tooltip>
  </q-btn>
</template>

<script>
export default {
  name: 'ToggleFullScreen',
}
</script>
