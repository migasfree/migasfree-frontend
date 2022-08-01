<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'
import { gettext } from 'boot/gettext'

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar()

    $q.dark.set($q.cookies.get('darkMode'), { expires: '30d' })
    gettext.current = $q.cookies.has('language')
      ? $q.cookies.get('language')
      : gettext.current
  },
})
</script>
