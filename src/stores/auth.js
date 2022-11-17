import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'
import { useUiStore } from './ui'

export const useAuthStore = defineStore('auth', {
  id: 'auth',
  state: () => ({
    token: LocalStorage.getItem('auth.token') || '',
    loggedIn: LocalStorage.getItem('auth.loggedIn') || false,
    user: LocalStorage.getItem('auth.user') || {},
    server: LocalStorage.getItem('auth.server') || {},
    domains: LocalStorage.getItem('auth.domains') || [
      {
        id: 0,
        name: gettext.$gettext('All').toUpperCase(),
      },
    ],
    scopes: LocalStorage.getItem('auth.scopes') || [
      {
        id: 0,
        name: gettext.$gettext('All').toLowerCase(),
      },
    ],
  }),
  getters: {
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.loggedIn,
    getDomains: (state) => state.domains,
    getScopes: (state) => state.scopes,
    filteredScopes: (state) => {
      if ('domain_preference' in state.user && state.user.domain_preference) {
        return state.scopes.filter(
          (el) =>
            (el.domain && el.domain.id === state.user.domain_preference.id) ||
            el.id === 0
        )
      }

      return state.scopes
    },
  },
  actions: {
    async login(data) {
      const uiStore = useUiStore()

      await api
        .post('/rest-auth/login/', data)
        .then((response) => {
          this.setToken(response.data.key)
          this.getUser()
          if (this.token) {
            this.setLoggedIn(true)
            this.getServerInfo()
            this.loadDomains()
            this.loadScopes()
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    getUser() {
      const uiStore = useUiStore()

      api
        .get('/rest-auth/user/')
        .then((response) => {
          if (response.data.is_staff === false) {
            this.reset()
            throw new Error(gettext.$gettext('Invalid credentials'))
          }

          this.setUser(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async getServerInfo() {
      const uiStore = useUiStore()

      await api
        .get('/api/v1/public/server/info/')
        .then((response) => {
          this.setServerInfo(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async logout() {
      const uiStore = useUiStore()

      await api
        .post('/rest-auth/logout/')
        .then((response) => {
          this.reset()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    reset() {
      this.setToken('')
      this.setLoggedIn(false)
      this.resetUser()
      this.resetServerInfo()
      this.resetDomains()
      this.resetScopes()
    },

    addDomain(payload) {
      if (!this.domains.find((el) => el.name === payload.name)) {
        this.deleteDomain(payload.id)
        this.domains.push(payload)
        this.domains.sort((a, b) =>
          a.id && b.id && a.name > b.name
            ? 1
            : a.id && b.id && b.name > a.name
            ? -1
            : 0
        )
        LocalStorage.set('auth.domains', this.domains)
      }
    },

    async loadDomains() {
      const uiStore = useUiStore()

      await api
        .get('/api/v1/token/domains/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.addDomain({ id: item.id, name: item.name })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    addScope(payload) {
      if (!this.scopes.find((el) => el.name === payload.name)) {
        this.deleteScope(payload.id)
        this.scopes.push(payload)
        this.scopes.sort((a, b) =>
          a.id && b.id && a.name > b.name
            ? 1
            : a.id && b.id && b.name > a.name
            ? -1
            : 0
        )
        LocalStorage.set('auth.scopes', this.scopes)
      }
    },

    async loadScopes() {
      const uiStore = useUiStore()

      await api
        .get('/api/v1/token/scopes/', { user__id: this.user.id })
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.addScope({
              id: item.id,
              name: item.name,
              domain: item.domain,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    setLoggedIn(value) {
      this.loggedIn = value
      LocalStorage.set('auth.loggedIn', this.loggedIn)
    },

    setUser(value) {
      this.user = value
      LocalStorage.set('auth.user', this.user)
    },

    setServerInfo(value) {
      this.server = value
      LocalStorage.set('auth.server', this.server)
    },

    setToken(value) {
      this.token = value
      LocalStorage.set('auth.token', this.token)
    },

    resetUser() {
      this.user = {}
      LocalStorage.set('auth.user', this.user)
    },

    resetServerInfo() {
      this.server = {}
      LocalStorage.set('auth.server', this.server)
    },

    deleteDomain(id) {
      const removeIndex = this.domains.map((item) => item.id).indexOf(id)
      if (removeIndex >= 0) this.domains.splice(removeIndex, 1)
    },

    resetDomains() {
      this.domains = [
        {
          id: 0,
          name: gettext.$gettext('All').toUpperCase(),
        },
      ]
      LocalStorage.set('auth.domains', this.domains)
    },

    deleteScope(id) {
      const removeIndex = this.scopes.map((item) => item.id).indexOf(id)
      if (removeIndex >= 0) this.scopes.splice(removeIndex, 1)
    },

    resetScopes() {
      this.scopes = [
        {
          id: 0,
          name: gettext.$gettext('All').toLowerCase(),
        },
      ]
      LocalStorage.set('auth.scopes', this.scopes)
    },
  },
})
