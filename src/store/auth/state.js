import { LocalStorage } from 'quasar'

export default function() {
  return {
    token: LocalStorage.getItem('auth.token') || '',
    loggedIn: LocalStorage.getItem('auth.loggedIn') || false,
    user: LocalStorage.getItem('auth.user') || {}
  }
}
