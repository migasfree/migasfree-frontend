import { SessionStorage, Notify } from 'quasar'
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { stringify } from 'qs'

import { gettext } from 'boot/gettext'

const api = axios.create({
  paramsSerializer: {
    serialize: stringify,
  },
  baseURL: process.env.MIGASFREE_SERVER || 'http://localhost',
})

const getAcceptLanguage = (lang) => {
  const [language, country] = lang.split('_')
  return `${language}-${country}, ${language};q=0.9`
}

export default boot(({ app, router }) => {
  let abortController = null

  router.beforeEach(async () => {
    // cancel any ongoing requests
    if (abortController) {
      abortController.abort()
      abortController = null
    }

    // set new abortController
    abortController = new AbortController()
    api.defaults.signal = abortController.signal
  })

  api.interceptors.request.use(
    (config) => {
      try {
        const authToken = SessionStorage.getItem('auth.token')

        if (
          authToken &&
          typeof authToken === 'string' &&
          authToken.trim() !== '' &&
          !config.url.includes('/api/v1/public/')
        ) {
          config.headers.Authorization = `Token ${authToken}`
        }

        if (config.url.includes('/api/v1/public/'))
          config.withCredentials = false

        // Safe language detection
        const currentLang =
          app.config.globalProperties.$language?.current ||
          SessionStorage.getItem('language') ||
          'en_US'

        config.headers['Accept-Language'] = getAcceptLanguage(currentLang)

        if (process.env.NODE_ENV === 'development') {
          console.debug('[ REQUEST ]', config.url, config.params)
        }
      } catch (error) {
        console.error('Error in axios request interceptor:', error)
      }

      return config
    },

    (error) => {
      return Promise.reject(error)
    },
  )

  api.interceptors.response.use(
    (response) => {
      console.debug('[ RESPONSE ]', response.config.url, response)
      return response
    },

    (error) => {
      if (error.code === 'ERR_CANCELED') {
        console.debug('Cancelled request')
        return Promise.reject(error)
      }

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
              message: gettext.$gettext('Session Expired'),
              caption: gettext.$gettext('Please login again'),
            })
            SessionStorage.remove('auth.token')

            router.push({ name: 'login' })
            break

          case 404:
            console.warn(
              `[ 404 ] Not Found: ${error.config.baseURL || ''}${error.config.url}`,
            )
            router.push({ name: 'not-found' })
            break

          case 500:
            Notify.create({
              type: 'negative',
              message: gettext.$gettext('Internal Server Error'),
              caption: gettext.$gettext('Please try again later'),
            })
            break

          default: {
            const status = error.response.status
            const data = error.response.data
            let caption =
              error.message || gettext.$gettext('An unexpected error occurred')

            // If the response is HTML, we avoid showing the raw content
            const isHtml = typeof data === 'string' && data.includes('<html')

            if (isHtml) {
              caption = gettext.$gettext(
                'The server returned an HTML error page.',
              )
            } else if (data && typeof data === 'object') {
              // Extract detail or first error message if it's a JSON response (DRF style)
              caption = data.detail || data.error || data.message || caption
            }

            console.error(`Unexpected error: ${status}`, error.message)
            if (data) console.error('Server response:', data)

            Notify.create({
              type: 'negative',
              message: `${gettext.$gettext('Error')} ${status}`,
              caption,
            })
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network Error:', error.message)
        Notify.create({
          type: 'negative',
          message: gettext.$gettext('Network Error'),
          caption: gettext.$gettext(
            'Unable to connect to the server. Please check your connection.',
          ),
        })
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
