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

export async function loadDomains(context) {
  // this.isLoadingDomain = true
  await this.$axios
    .get('/api/v1/token/domains/')
    .then((response) => {
      Object.entries(response.data.results).map(([index, item]) => {
        context.commit('addDomain', {
          id: item.id,
          name: item.name
        })
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
  // .finally(() => (this.isLoadingDomain = false))
}

export async function loadScopes(context) {
  const user = this.getters['auth/user']

  const scopeParams = {
    user: user.id
  }
  if (user.domain_preference) {
    scopeParams.domain__id = this.user.domain_preference
  }

  // this.isLoadingScope = true
  await this.$axios
    .get('/api/v1/token/scopes/', scopeParams)
    .then((response) => {
      console.log(scopeParams, response.data)
      Object.entries(response.data.results).map(([index, item]) => {
        context.commit('addScope', {
          id: item.id,
          name: item.name
        })
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
  // .finally(() => (this.isLoadingScope = false))
}
