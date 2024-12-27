import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'
import { useUiStore } from './ui'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(LocalStorage.getItem('auth.token')) || ref('')
  const loggedIn = ref(LocalStorage.getItem('auth.loggedIn')) || ref(false)
  const user = ref(LocalStorage.getItem('auth.user')) || ref({})
  const server = ref(LocalStorage.getItem('auth.server')) || ref({})
  const domains =
    ref(LocalStorage.getItem('auth.domains')) ||
    ref([
      {
        id: 0,
        name: gettext.$gettext('All').toUpperCase(),
      },
    ])
  const scopes =
    ref(LocalStorage.getItem('auth.scopes')) ||
    ref([
      {
        id: 0,
        name: gettext.$gettext('All').toLowerCase(),
      },
    ])

  const filteredScopes = computed(() => {
    if ('domain_preference' in user.value && user.value.domain_preference) {
      return scopes.value.filter(
        (el) =>
          (el.domain && el.domain.id === user.value.domain_preference.id) ||
          el.id === 0,
      )
    }

    return scopes.value
  })

  async function login(data) {
    const uiStore = useUiStore()

    await api
      .post('/rest-auth/login/', data)
      .then((response) => {
        setToken(response.data.key)
        getUser()
        if (token.value) {
          setLoggedIn(true)
          getServerInfo()
          loadDomains()
          loadScopes()
        }
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function getUser() {
    const uiStore = useUiStore()

    api
      .get('/rest-auth/user/')
      .then((response) => {
        if (response.data.is_staff === false) {
          reset()
          throw new Error(gettext.$gettext('Invalid credentials'))
        }

        setUser(response.data)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function getServerInfo() {
    const uiStore = useUiStore()

    await api
      .get('/api/v1/public/server/info/')
      .then((response) => {
        setServerInfo(response.data)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function logout() {
    const uiStore = useUiStore()

    await api
      .post('/rest-auth/logout/')
      .then(() => {
        reset()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function reset() {
    setToken('')
    setLoggedIn(false)
    resetUser()
    resetServerInfo()
    resetDomains()
    resetScopes()
  }

  function sortByName(a, b) {
    return a.id && b.id && a.name > b.name
      ? 1
      : a.id && b.id && b.name > a.name
        ? -1
        : 0
  }

  function addDomain(payload) {
    if (!domains.value.find((el) => el.name === payload.name)) {
      deleteDomain(payload.id)
      domains.value.push(payload)
      domains.value.sort(sortByName)
      LocalStorage.set('auth.domains', domains.value)
    }
  }

  async function loadDomains() {
    const uiStore = useUiStore()

    await api
      .get('/api/v1/token/domains/')
      .then((response) => {
        Object.entries(response.data.results).map(([, item]) => {
          addDomain({ id: item.id, name: item.name })
        })
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function addScope(payload) {
    if (!scopes.value.find((el) => el.name === payload.name)) {
      deleteScope(payload.id)
      scopes.value.push(payload)
      scopes.value.sort(sortByName)
      LocalStorage.set('auth.scopes', scopes.value)
    }
  }

  async function loadScopes() {
    const uiStore = useUiStore()

    await api
      .get('/api/v1/token/scopes/', { user__id: user.id })
      .then((response) => {
        Object.entries(response.data.results).map(([, item]) => {
          addScope({
            id: item.id,
            name: item.name,
            domain: item.domain,
          })
        })
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function setLoggedIn(value) {
    loggedIn.value = value
    LocalStorage.set('auth.loggedIn', loggedIn.value)
  }

  function setUser(value) {
    user.value = value
    LocalStorage.set('auth.user', user.value)
  }

  function setServerInfo(value) {
    server.value = value
    LocalStorage.set('auth.server', server.value)
  }

  function setToken(value) {
    token.value = value
    LocalStorage.set('auth.token', token.value)
  }

  function resetUser() {
    user.value = {}
    LocalStorage.set('auth.user', user.value)
  }

  function resetServerInfo() {
    server.value = {}
    LocalStorage.set('auth.server', server.value)
  }

  function deleteDomain(id) {
    const removeIndex = domains.value.map((item) => item.id).indexOf(id)
    if (removeIndex >= 0) domains.value.splice(removeIndex, 1)
  }

  function resetDomains() {
    domains.value = [
      {
        id: 0,
        name: gettext.$gettext('All').toUpperCase(),
      },
    ]
    LocalStorage.set('auth.domains', domains.value)
  }

  function deleteScope(id) {
    const removeIndex = scopes.value.map((item) => item.id).indexOf(id)
    if (removeIndex >= 0) scopes.value.splice(removeIndex, 1)
  }

  function resetScopes() {
    scopes.value = [
      {
        id: 0,
        name: gettext.$gettext('All').toLowerCase(),
      },
    ]
    LocalStorage.set('auth.scopes', scopes.value)
  }

  return {
    token,
    loggedIn,
    user,
    server,
    domains,
    scopes,
    filteredScopes,
    login,
    logout,
    reset,
    addDomain,
    addScope,
    loadScopes,
    setUser,
    deleteDomain,
    deleteScope,
  }
})
