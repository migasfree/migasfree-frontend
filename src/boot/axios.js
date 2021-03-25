import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import { LocalStorage } from 'quasar'

const axiosInstance = axios.create({
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
  baseURL: process.env.MIGASFREE_SERVER || 'http://localhost'
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
    // TODO https://haxzie.com/architecting-http-clients-vue-js-network-layer
    console.error(error.response.status, error.message)
    return Promise.reject(error)
  }
)

const setBaseURL = (baseURL) => {
  axiosInstance.defaults.baseURL = baseURL
}

export default ({ store, Vue, setBaseURL }) => {
  Vue.prototype.$axios = axiosInstance
  store.$axios = axiosInstance
}
