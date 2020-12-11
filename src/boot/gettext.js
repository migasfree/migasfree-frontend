import Vue from 'vue'
import GetTextPlugin from 'vue-gettext'
import translations from '../i18n/translations.json'

Vue.use(GetTextPlugin, { translations, defaultLanguage: 'es_ES' })

/*
Vue.use(GetTextPlugin, {
  availableLanguages: {
    en_GB: 'British English',
    en_US: 'American English',
    es_ES: 'Español',
    fr_FR: 'Français',
    it_IT: 'Italiano',
  },
  defaultLanguage: 'fr_FR',
  languageVmMixin: {
    computed: {
      currentKebabCase: function () {
        return this.current.toLowerCase().replace('_', '-')
      },
    },
  },
  translations,
  silent: true,
})
*/
