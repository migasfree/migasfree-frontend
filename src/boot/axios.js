import { LocalStorage } from 'quasar'
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import qs from 'qs'

const api = axios.create({
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
  baseURL: process.env.MIGASFREE_SERVER || 'http://localhost',
})

export default boot(({ app, router }) => {
  api.interceptors.request.use(
    (config) => {
      const authToken = LocalStorage.getItem('auth.token')

      if (authToken) config.headers.common.Authorization = `Token ${authToken}`

      const currentLang = app.config.globalProperties.$language.current
      config.headers['Accept-Language'] = `${currentLang.replace('_', '-')},${
        currentLang.split('_')[0]
      };q=0.9`

      console.log('[ REQUEST ]', config.url, config.params)

      return config
    },

    (error) => {
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    (response) => {
      console.log('[ RESPONSE ]', response.config.url, response)
      return response
    },

    (error) => {
      switch (error.response.status) {
        case 400:
          console.error(error.response.status, error.message)
          // notify.warn('Nothing to display', 'Data Not Found')
          break

        // authentication error, logout the user
        case 401:
          // notify.warn('Please login again', 'Session Expired')
          LocalStorage.removeItem('auth.token')
          router.push('login')
          break

        default:
          console.error(error.response.status, error.message)
        // notify.error('Server Error')
      }

      return Promise.reject(error)
    }
  )

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
