<template>
  <router-view />
</template>

<script setup>
import { watch, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { gettext } from 'boot/gettext'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'
import { appIcon } from 'composables/element'

defineOptions({ name: 'App' })

const $q = useQuasar()
const authStore = useAuthStore()

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

// Auto-refresh logic
const CHECK_INTERVAL_MS = 1000 * 60 * 5 // 5 minutes
let versionCheckInterval = null
const notificationShowing = ref(false)

const checkAppVersion = async () => {
  // Only verify if a version already exists (the user has loaded the info)
  if (!authStore.server.version) return

  try {
    const { data } = await api.get('/api/v1/public/server/info/')
    if (data.version && data.version !== authStore.server.version) {
      // The version has changed and we haven't shown the dialog yet
      if (!notificationShowing.value) {
        notificationShowing.value = true
        $q.notify({
          message: gettext.$gettext(
            'A new version of the application is available.',
          ),
          caption: gettext.$gettext(
            'Please refresh the page to apply the updates and ensure optimal performance.',
          ),
          color: 'accent',
          textColor: 'primary',
          icon: appIcon('load'),
          iconColor: 'primary',
          position: 'top',
          timeout: 0, // Does not auto-dismiss
          classes: 'glass-card q-pa-md text-h6 shadow-10',
          actions: [
            {
              label: gettext.$gettext('Refresh'),
              color: 'primary',
              icon: appIcon('update'),
              handler: () => {
                window.location.reload(true)
              },
            },
          ],
          onDismiss: () => {
            notificationShowing.value = false
          },
        })
      }
    }
  } catch (error) {
    // Ignore network errors in silent periodic check
    console.debug('Failed to check server version:', error)
  }
}

onMounted(() => {
  versionCheckInterval = setInterval(checkAppVersion, CHECK_INTERVAL_MS)
})

onUnmounted(() => {
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval)
  }
})
</script>
