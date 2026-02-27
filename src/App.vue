<template>
  <router-view />
</template>

<script>
import { defineComponent, watch } from 'vue'
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

    watch(
      () => gettext.current,
      (val) => {
        if (val) {
          document.documentElement.lang = val.replace('_', '-')
        }
      },
      { immediate: true },
    )
  },
})
</script>
