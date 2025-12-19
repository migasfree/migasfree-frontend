import { setup } from '@storybook/vue3'
import { Quasar } from 'quasar'
import { createGettext } from 'vue3-gettext'

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

setup((app) => {
  // Install Quasar
  app.use(Quasar, {
    plugins: {},
    config: {},
  })

  // Install vue3-gettext
  app.use(gettext)
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
