<template>
  <router-view />
</template>

<script>
import { defineComponent, watchEffect } from 'vue'
import { useQuasar } from 'quasar'
import { gettext } from 'boot/gettext'

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar()

    $q.dark.set($q.cookies.get('darkMode'), { expires: '30d' })
    if ($q.cookies.has('language')) {
      gettext.current = $q.cookies.get('language')
    }

    watchEffect(() => {
      if (gettext.current) {
        document.documentElement.lang = gettext.current.replace('_', '-')
      }
    })
  },
})
</script>
