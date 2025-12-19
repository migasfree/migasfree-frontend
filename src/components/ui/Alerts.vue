<template>
  <q-btn-dropdown v-if="isAlertsVisible" flat stretch>
    <template #label>
      <q-icon :name="appIcon('alert')" />

      <q-chip :label="totalAlerts" color="white" text-color="black" />

      <q-tooltip>
        {{ $gettext('Alerts') }}
      </q-tooltip>
    </template>

    <q-list v-if="alerts">
      <q-item
        v-for="(item, index) in alerts"
        :key="index"
        v-close-popup
        clickable
        :to="resolveAlertLink(item.api)"
      >
        <q-item-section avatar>
          <q-icon :name="target(item.target)" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ resolveAlertText(item) }}</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-chip :color="level(item.level)" :text-color="textColor(item.level)"
            ><strong>{{ item.result }}</strong></q-chip
          >
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import { appIcon } from 'composables/element'

export default defineComponent({
  name: 'Alerts',

  setup() {
    const { $gettext } = useGettext()
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    const uiStore = useUiStore()

    const alerts = ref([])
    const totalAlerts = ref(0)
    const socket = ref(null)

    const { loggedIn } = storeToRefs(authStore)

    const isAlertsVisible = computed(
      () => loggedIn.value && alerts.value.length > 0,
    )

    const loadAlerts = async () => {
      try {
        const { data } = await api.get('/api/v1/token/stats/alerts/')
        updateData(data)
      } catch (error) {
        if (error?.response?.status === 403) {
          $q.localStorage.remove('auth.token')
          router.push({ name: 'login' })
        }
        uiStore.notifyError(error)
      }
    }

    const updateData = (newData) => {
      alerts.value = newData.filter((item) => parseInt(item.result) > 0)

      totalAlerts.value = alerts.value.reduce(
        (accumulator, current) => accumulator + parseInt(current.result),
        0,
      )
    }

    const target = (value) => {
      return value === 'computer' ? 'mdi-laptop' : 'mdi-cloud'
    }

    const level = (value) => {
      if (value === 'critical') return 'negative'

      return value
    }

    const textColor = (value) => {
      if (value === 'critical') return 'white'

      return 'black'
    }

    const resolveAlertLink = (value) => {
      const query = value.query
        ? Object.fromEntries(
            Object.entries(value.query).map(([k, v]) => [
              k,
              typeof v === 'boolean' ? v.toString() : v,
            ]),
          )
        : {}

      if (!('model' in value)) return value

      const routes = {
        errors: 'errors-list',
        faults: 'faults-list',
        notifications: 'notifications-list',
        package_sets: 'package-sets-list',
        packages: 'packages-list',
        deployments: 'deployments-list',
        messages: 'messages-list',
      }

      const name = routes[value.model]
      return name ? { name, query } : value
    }

    const resolveAlertText = (value) => {
      const { api } = value
      if (!api?.model) return value.msg

      const messages = {
        packages: $gettext('Orphan Packages'),
        notifications: $gettext('Unchecked Notifications'),
        faults: $gettext('Unchecked Faults'),
        errors: $gettext('Unchecked Errors'),
      }
      if (api.model in messages) return messages[api.model]

      if (api.model === 'deployments') {
        const query = api.query ?? {}

        if ('id_in' in query) return $gettext('Generating Repositories')

        if ('percent__lt' in query)
          return $gettext('Active schedule Deployments')

        if ('percent__gte' in query)
          return $gettext('Finished schedule Deployments')
      }

      if (api.model === 'messages') {
        const query = api.query ?? {}

        if ('created_at__gte' in query)
          return $gettext('Synchronizing Computers Now')

        if ('created_at__lt' in query) return $gettext('Delayed Computers')
      }

      return value.msg
    }

    const connectWS = () => {
      const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      socket.value = new WebSocket(
        `${wsScheme}://${uiStore.server.split('//')[1]}/alerts/`,
      )

      socket.value.onmessage = (event) => {
        updateData(JSON.parse(event.data))
      }

      socket.value.onclose = () => setTimeout(connectWS, 1000)

      socket.value.onerror = (error) => {
        console.error(error.message ?? error)
        socket.value?.close()
      }
    }

    onMounted(async () => {
      if (loggedIn.value) {
        await loadAlerts()
        connectWS()
      }
    })

    onUnmounted(() => {
      socket.value?.close()
    })

    watch(loggedIn, (newValue) => {
      if (newValue) loadAlerts()
    })

    return {
      alerts,
      totalAlerts,
      isAlertsVisible,
      target,
      level,
      textColor,
      resolveAlertLink,
      resolveAlertText,
      appIcon,
    }
  },
})
</script>
