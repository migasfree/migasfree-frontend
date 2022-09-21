<template>
  <q-btn-dropdown v-if="isAlertsVisible" flat stretch>
    <template #label>
      <q-icon name="mdi-bell" />

      <q-chip :label="totalAlerts" color="white" text-color="black" />

      <q-tooltip>
        <translate>Alerts</translate>
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
          <q-chip
            :label="item.result"
            :color="level(item.level)"
            :text-color="textColor(item.level)"
          />
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
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useQuasar } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

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

    const loggedIn = computed(() => {
      return authStore.loggedIn
    })

    const isAlertsVisible = computed(() => {
      return loggedIn.value && alerts.value.length > 0
    })

    const loadAlerts = async () => {
      await api
        .get('/api/v1/token/stats/alerts/')
        .then((response) => {
          updateData(response.data)
        })
        .catch((error) => {
          if (
            typeof error !== undefined &&
            typeof error.response !== undefined &&
            error.response.status === 403
          ) {
            $q.localStorage.remove('auth.token')
            router.push({ name: 'login' })
          }
          uiStore.notifyError(error)
        })
    }

    const updateData = (newData) => {
      alerts.value = newData.filter((item) => parseInt(item.result) > 0)

      totalAlerts.value = alerts.value.reduce(
        (accumulator, current) => accumulator + parseInt(current.result),
        0
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
      switch (value) {
        case 'critical':
          return 'white'
        default:
          return 'black'
      }
    }

    const resolveAlertLink = (value) => {
      let query = {}
      if ('query' in value) {
        Object.entries(value.query).forEach(([key, value]) => {
          if (typeof value === 'boolean') query[key] = value.toString()
          else query[key] = value
        })
      }

      if ('model' in value) {
        switch (value.model) {
          case 'errors':
            return { name: 'errors-list', query }
          case 'faults':
            return { name: 'faults-list', query }
          case 'notifications':
            return { name: 'notifications-list', query }
          case 'packages':
            return { name: 'packages-list', query }
          case 'deployments':
            return { name: 'deployments-list', query }
          case 'messages':
            return { name: 'messages-list', query }
        }
      }

      return value
    }

    const resolveAlertText = (value) => {
      if ('model' in value.api) {
        switch (value.api.model) {
          case 'packages':
            return $gettext('Orphan Packages')
          case 'notifications':
            return $gettext('Unchecked Notifications')
          case 'faults':
            return $gettext('Unchecked Faults')
          case 'errors':
            return $gettext('Unchecked Errors')
          case 'deployments':
            if ('id_in' in value.api.query)
              return $gettext('Generating Repositories')

            if ('percent__lt' in value.api.query)
              return $gettext('Active schedule Deployments')

            if ('percent__gte' in value.api.query)
              return $gettext('Finished schedule Deployments')

            break
          case 'messages':
            if ('created_at__gte' in value.api.query)
              return $gettext('Synchronizing Computers Now')

            if ('created_at__lt' in value.api.query)
              return $gettext('Delayed Computers')

            break
        }
      }

      return value.msg
    }

    const connectWS = () => {
      const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      socket.value = new WebSocket(
        `${wsScheme}://${uiStore.getServer.split('//')[1]}/alerts/`
      )

      socket.value.onmessage = (event) => {
        const response = JSON.parse(event.data)
        updateData(response)
      }

      socket.value.onclose = (e) => {
        setTimeout(() => {
          connectWS()
        }, 1000)
      }

      socket.value.onerror = (error) => {
        console.error(error.message)
        socket.value.close()
      }
    }

    onMounted(async () => {
      if (loggedIn.value) {
        await loadAlerts()
        connectWS()
      }
    })

    onUnmounted(() => {
      socket.value.close()
    })

    watch(loggedIn, (newValue) => {
      if (newValue) loadAlerts()
    })

    return {
      alerts,
      totalAlerts,
      socket,
      loggedIn,
      isAlertsVisible,
      loadAlerts,
      updateData,
      target,
      level,
      textColor,
      resolveAlertLink,
      resolveAlertText,
    }
  },
})
</script>
