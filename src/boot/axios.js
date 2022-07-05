import axios from 'axios'
import qs from 'qs'
import { LocalStorage } from 'quasar'

export default ({ store, Vue, router }) => {
  const cancelSource = axios.CancelToken.source()

  const axiosInstance = axios.create({
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    },
    baseURL: process.env.MIGASFREE_SERVER || 'http://localhost',
  })

  axiosInstance.interceptors.request.use(
    (config) => {
      const authToken = LocalStorage.getItem('auth.token')

      if (authToken) {
        config.headers.Authorization = `Token ${authToken}`
      }

      config.headers['Accept-Language'] = `${Vue.config.language.replace(
        '_',
        '-'
      )},${Vue.config.language.split('_')[0]};q=0.9`

      // config.timeout = 10000
      config.cancelToken = cancelSource.token

      console.log('[ REQUEST ]', config.url, config.params)

      return config
    },

    (error) => {
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
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

  const setBaseURL = (baseURL) => {
    axiosInstance.defaults.baseURL = baseURL
  }

  Vue.prototype.$axios = axiosInstance
  store.$axios = axiosInstance
}
