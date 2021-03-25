export async function login(context, data) {
  await this.$axios
    .post('/rest-auth/login/', data)
    .then((response) => {
      context.commit('setToken', response.data.key)
      context.commit('setLoggedIn', true)
      context.dispatch('getUser')
      context.dispatch('loadDomains')
      context.dispatch('loadScopes')
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getUser(context) {
  await this.$axios
    .get('/rest-auth/user/')
    .then((response) => {
      context.commit('setUser', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function logout(context) {
  await this.$axios
    .post('/rest-auth/logout/')
    .then((response) => {
      context.dispatch('reset')
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export function reset(context) {
  context.commit('setToken', '')
  context.commit('setLoggedIn', false)
  context.commit('setUser', {})
  context.commit('resetDomains')
  context.commit('resetScopes')
}

export function addDomain(context, payload) {
  const domains = this.getters['auth/domains']

  if (!domains.find((el) => el.name === payload.name)) {
    context.commit('deleteDomain', payload.id)
    context.commit('addDomain', payload)
  }
}

export async function loadDomains(context) {
  await this.$axios
    .get('/api/v1/token/domains/')
    .then((response) => {
      Object.entries(response.data.results).map(([index, item]) => {
        context.dispatch('addDomain', {
          id: item.id,
          name: item.name
        })
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export function addScope(context, payload) {
  const scopes = this.getters['auth/scopes']

  if (!scopes.find((el) => el.name === payload.name)) {
    context.commit('deleteScope', payload.id)
    context.commit('addScope', payload)
  }
}

export async function loadScopes(context) {
  const user = this.getters['auth/user']

  await this.$axios
    .get('/api/v1/token/scopes/', { user__id: user.id })
    .then((response) => {
      Object.entries(response.data.results).map(([index, item]) => {
        context.dispatch('addScope', {
          id: item.id,
          name: item.name,
          domain: item.domain
        })
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
