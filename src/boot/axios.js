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
  function(config) {
    const authToken = LocalStorage.getItem('auth.token')

    if (authToken) {
      config.headers.Authorization = `Token ${authToken}`
    }

    console.log('[ REQUEST ]' + config.url)

    return config
  },
  function(err) {
    return Promise.reject(err)
  }
)

const setErrorInterceptor = (errorFunction) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (!error.response) {
        errorFunction()
      }
      return Promise.reject(error)
    }
  )
}

const setBaseURL = (baseURL) => {
  axiosInstance.defaults.baseURL = baseURL
}

export default ({ store, Vue, setBaseURL }) => {
  Vue.prototype.$axios = axiosInstance
  store.$axios = axiosInstance
}
