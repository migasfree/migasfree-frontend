import { LocalStorage } from 'quasar'
import { translate } from 'vue-gettext'

export default function() {
  return {
    token: LocalStorage.getItem('auth.token') || '',
    loggedIn: LocalStorage.getItem('auth.loggedIn') || false,
    user: LocalStorage.getItem('auth.user') || {},
    domains: LocalStorage.getItem('auth.domains') || [
      { id: 0, name: translate.gettext('All').toUpperCase() }
    ],
    scopes: LocalStorage.getItem('auth.scopes') || [
      { id: 0, name: translate.gettext('All').toLowerCase() }
    ]
  }
}
