import { LocalStorage } from 'quasar'
import { translate } from 'vue-gettext'

export function setUser(state, value) {
  state.user = value
  LocalStorage.set('auth.user', state.user)
}

export function setLoggedIn(state, value) {
  state.loggedIn = value
  LocalStorage.set('auth.loggedIn', state.loggedIn)
}

export function setToken(state, value) {
  state.token = value
  LocalStorage.set('auth.token', state.token)
}

export function addDomain(state, value) {
  state.domains.push(value)
  LocalStorage.set('auth.domains', state.domains)
}

export function resetDomains(state) {
  state.domains = [{ id: 0, name: translate.gettext('All').toUpperCase() }]
  LocalStorage.set('auth.domains', state.domains)
}

export function addScope(state, value) {
  state.scopes.push(value)
  LocalStorage.set('auth.scopes', state.scope)
}

export function resetScopes(state) {
  state.scopes = [{ id: 0, name: translate.gettext('All').toLowerCase() }]
  LocalStorage.set('auth.scopes', state.scopes)
}
