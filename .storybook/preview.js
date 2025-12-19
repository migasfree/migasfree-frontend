import { setup } from '@storybook/vue3'
import { Quasar } from 'quasar'
import { createGettext } from 'vue3-gettext'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

// Import Quasar styles
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'

// Create gettext instance with empty translations (passthrough)
const gettext = createGettext({
  availableLanguages: { en: 'English' },
  defaultLanguage: 'en',
  translations: {},
  silent: true,
})

// Create Pinia instance
const pinia = createPinia()

// Create minimal router for components that use router-link
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

setup((app) => {
  // Install Quasar
  app.use(Quasar, {
    plugins: {},
    config: {},
  })

  // Install vue3-gettext
  app.use(gettext)

  // Install Pinia
  app.use(pinia)

  // Install Vue Router
  app.use(router)
})

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
