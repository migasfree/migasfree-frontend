export async function login(context, data) {
  await this.$axios
    .post('/rest-auth/login/', data)
    .then((response) => {
      context.commit('setToken', response.data.key)
      context.commit('setLoggedIn', true)
      context.dispatch('getUser')
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
      context.commit('setToken', '')
      context.commit('setLoggedIn', false)
      context.commit('setUser', {})
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
