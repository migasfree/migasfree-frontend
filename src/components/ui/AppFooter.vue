<template>
  <q-footer>
    <q-toolbar>
      &copy; {{ MIGASFREE_MIN_YEAR }}-{{ new Date().getFullYear() }}
      <q-btn
        stretch
        flat
        label="migasfree"
        type="a"
        href="http://www.migasfree.org/"
        no-caps
        size="16px"
        ><q-tooltip>{{ $gettext('Website') }}</q-tooltip></q-btn
      >
      <q-btn
        stretch
        flat
        label="GPLv3"
        type="a"
        href="http://www.gnu.org/licenses/gpl.html"
        no-caps
        size="16px"
        ><q-tooltip>{{ $gettext('License') }}</q-tooltip></q-btn
      >
      <q-btn-dropdown flat stretch>
        <template #label>
          <q-icon name="mdi-github" />

          <q-tooltip>
            {{ $gettext('Source code') }}
          </q-tooltip>
        </template>

        <q-list>
          <q-item
            v-close-popup
            clickable
            href="https://github.com/migasfree/migasfree-frontend"
          >
            <q-item-section>
              <q-item-label>Frontend</q-item-label>
              <q-item-label caption>{{ appVersion }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-close-popup
            clickable
            href="https://github.com/migasfree/migasfree-backend"
          >
            <q-item-section>
              <q-item-label>Backend</q-item-label>
              <q-item-label caption>{{ serverVersion }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-space />

      <q-btn stretch flat icon="mdi-api" type="a" :href="apiLink">
        <q-tooltip>{{ $gettext('API Rest Info') }}</q-tooltip></q-btn
      >

      <q-btn
        stretch
        flat
        icon="mdi-text-box-multiple"
        type="a"
        href="http://fun-with-migasfree.readthedocs.io/"
      >
        <q-tooltip anchor="top middle" self="bottom right">{{
          $gettext('migasfree documentation')
        }}</q-tooltip></q-btn
      >
    </q-toolbar>
  </q-footer>
</template>

<script>
import { computed } from 'vue'

import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'
import { MIGASFREE_MIN_YEAR } from 'config/app.conf'

const app = require('../../../package.json')

export default {
  setup() {
    const authStore = useAuthStore()
    const apiLink = `${api.defaults.baseURL}/docs/`

    const serverVersion = computed(() => {
      return authStore.server.version
    })

    return {
      apiLink,
      serverVersion,
      appVersion: app.version,
      MIGASFREE_MIN_YEAR,
    }
  },
}
</script>
