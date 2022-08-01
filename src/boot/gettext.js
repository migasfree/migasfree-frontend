import { boot } from 'quasar/wrappers'
import { createGettext } from 'vue3-gettext'
import translations from '../i18n/translations.json'

const gettext = createGettext({
  availableLanguages: {
    en_US: 'American English',
    es_ES: 'Español',
  },
  translations,
  defaultLanguage: 'es_ES',
  mutedLanguages: ['en_US'],
  setGlobalProperties: true,
})

export default boot(({ app, store }) => {
  app.config.globalProperties.$gettext = gettext
  app.use(gettext)
  store.$gettext = gettext
})

export { gettext }
