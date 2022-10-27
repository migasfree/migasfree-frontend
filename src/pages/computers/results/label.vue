<template>
  <q-card id="label" flat bordered square>
    <q-list dense>
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img alt="Migasfree logo" src="~assets/migasfree-logo-mini.svg" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ label.search }}</q-item-label>
          <q-item-label
            caption
            :class="$q.dark.isActive ? 'text-white' : 'text-black'"
          >
            {{ label.uuid }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-server-network" size="md" />
        </q-item-section>

        <q-item-section>{{ server }}</q-item-section>
      </q-item>

      <q-separator inset />

      <q-item class="text-center">
        <q-item-section>
          {{ label.helpdesk }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

export default {
  setup() {
    const { $gettext } = useGettext()
    const route = useRoute()
    const uiStore = useUiStore()

    const label = reactive({})

    onMounted(async () => {
      await api
        .get(`/api/v1/token/computers/${route.params.id}/label`)
        .then((response) => {
          Object.assign(label, response.data)
          useMeta({ title: `${$gettext('Identification')}: ${label.search}` })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    })

    return { label, server: uiStore.server }
  },
}
</script>

<style scoped>
#label {
  width: 20em;
  border: 1px solid #000 !important;
}
</style>
