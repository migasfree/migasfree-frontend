import Vue from 'vue'
import GetTextPlugin from 'vue-gettext'
import translations from '../i18n/translations.json'

Vue.use(GetTextPlugin, {
  availableLanguages: {
    en_US: 'American English',
    es_ES: 'Español'
  },
  languageVmMixin: {
    computed: {
      currentKebabCase: function() {
        return this.current.toLowerCase().replace('_', '-')
      }
    }
  },
  translations,
  defaultLanguage: 'es_ES'
})
