import { LocalStorage } from 'quasar'

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
}

export function addScope(state, value) {
  state.scopes.push(value)
}
