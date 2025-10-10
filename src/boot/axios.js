import { LocalStorage, Notify } from 'quasar'
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { parse, stringify } from 'qs'

const api = axios.create({
  paramsSerializer: {
    encode: parse,
    serialize: stringify,
  },
  baseURL: process.env.MIGASFREE_SERVER || 'http://localhost',
})

function getAcceptLanguage(lang) {
  const [language, country] = lang.split('_')
  return `${language}-${country}, ${language};q=0.9`
}

export default boot(({ app, router }) => {
  api.interceptors.request.use(
    (config) => {
      const authToken = LocalStorage.getItem('auth.token')

      if (
        authToken &&
        typeof authToken === 'string' &&
        !config.url.includes('/api/v1/public/')
      )
        config.headers.Authorization = `Token ${authToken}`

      if (config.url.includes('/api/v1/public/')) config.withCredentials = false

      const currentLang = app.config.globalProperties.$language.current
      config.headers['Accept-Language'] = getAcceptLanguage(currentLang)

      if (process.env.NODE_ENV === 'development')
        console.log('[ REQUEST ]', config.url, config.params, config)

      return config
    },

    (error) => {
      return Promise.reject(error)
    },
  )

  api.interceptors.response.use(
    (response) => {
      console.log('[ RESPONSE ]', response.config.url, response)
      return response
    },

    (error) => {
      if ('response' in error && 'status' in error.response) {
        switch (error.response.status) {
          case 400:
            console.error(error.response.status, error.message)
            /* Notify.create({
              type: 'warning',
              message: 'Data Not Found',
              caption: 'Nothing to display',
            }) */
            break

          // authentication error, logout the user
          case 401:
            Notify.create({
              type: 'warning',
              message: 'Session Expired',
              caption: 'Please login again',
            })
            LocalStorage.remove('auth.token')
            router.push({ name: 'login' })
            break

          case 404:
            router.push({ name: 'not-found' })
            break

          default:
            console.error(
              `Unexpected error: ${error.response.status}`,
              error.message,
            )
            if ('data' in error.response)
              console.error('Server response:', error.response.data)
          /* Notify.create({
              type: 'negative',
              message: 'An unexpected error occurred',
              caption: 'Server Error',
            }) */
        }
      }

      return Promise.reject(error)
    },
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
