export async function login(context, data) {
  await this.$axios
    .post('/rest-auth/login/', data)
    .then((response) => {
      context.commit('setToken', response.data.key)
      context.commit('setLoggedIn', true)
      context.dispatch('getUser')
    })
    .catch((error) => {
      console.error(error.response || error)
      context.dispatch(
        'ui/notifyError',
        error.response.data.non_field_errors || error.response.data.detail,
        { root: true }
      )
    })
}

export async function getUser(context) {
  await this.$axios
    .get('/rest-auth/user/')
    .then((response) => {
      context.commit('setUser', response.data)
    })
    .catch((error) => {
      console.error(error.response)
      context.dispatch(
        'ui/notifyError',
        error.response.data.non_field_errors || error.response.data,
        { root: true }
      )
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
      console.error(error.response)
      context.dispatch(
        'ui/notifyError',
        error.response.data.non_field_errors || error.response.data,
        { root: true }
      )
    })
}
