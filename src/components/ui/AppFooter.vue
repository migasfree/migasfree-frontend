<template>
  <q-footer>
    <q-toolbar>
      &copy; 2010-{{ new Date().getFullYear() }}
      <q-btn
        stretch
        flat
        label="migasfree"
        type="a"
        href="http://www.migasfree.org/"
        no-caps
        size="16px"
        ><q-tooltip><translate>Website</translate></q-tooltip></q-btn
      >
      <q-btn
        stretch
        flat
        label="GPLv3"
        type="a"
        href="http://www.gnu.org/licenses/gpl.html"
        no-caps
        size="16px"
        ><q-tooltip><translate>License</translate></q-tooltip></q-btn
      >
      <q-btn-dropdown flat stretch>
        <template #label>
          <q-icon name="mdi-github" />

          <q-tooltip>
            <translate>Source code</translate>
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
        <q-tooltip><translate>API Rest Info</translate></q-tooltip></q-btn
      >

      <q-btn
        stretch
        flat
        icon="mdi-text-box-multiple"
        type="a"
        href="http://fun-with-migasfree.readthedocs.io/"
      >
        <q-tooltip anchor="top middle" self="bottom right"
          ><translate>migasfree documentation</translate></q-tooltip
        ></q-btn
      >
    </q-toolbar>
  </q-footer>
</template>

<script>
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

const app = require('../../../package.json')

export default {
  setup() {
    const authStore = useAuthStore()
    const apiLink = `${api.defaults.baseURL}/docs/`

    return {
      apiLink,
      serverVersion: authStore.server.version,
      appVersion: app.version,
    }
  },
}
</script>
