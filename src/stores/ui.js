import { ref } from 'vue'
import { defineStore } from 'pinia'
import { scroll, Notify } from 'quasar'

import { appIcon } from 'composables/element'

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const currentPageTable = ref(1)
  const server = ref(process.env.MIGASFREE_SERVER || 'http://localhost')

  const scrollToElement = (element) => {
    if (!element) return
    const target = scroll.getScrollTarget(element)
    const offset = element.offsetTop
    const duration = 1000

    scroll.setVerticalScrollPosition(target, offset, duration)
  }

  const notifyError = (error) => {
    let message = typeof error === 'string' ? error : (error?.message ?? '')

    const status = error?.response?.status
    if (status) {
      switch (status) {
        case 401:
          message = 'UnAuthorized'
          break
        case 403:
          message = 'Forbidden'
          break
        case 404:
          message = 'API Route is Missing or Undefined'
          break
        case 405:
          message = 'API Route Method Not Allowed'
          break
        case 422:
          message = 'Validation Error'
          break
        default:
          if (status >= 500) message = 'Server Error'
      }
    }

    // Attempt to override with response body
    const data = error?.response?.data
    if (data) {
      if (typeof data === 'string') {
        message = data
      } else if (Object.keys(data).length) {
        message = data[Object.keys(data)[0]]
      }
    }

    Notify.create({
      color: 'negative',
      position: 'bottom',
      message,
      icon: appIcon('error'),
    })
  }

  const notifySuccess = (message) => {
    Notify.create({
      color: 'positive',
      position: 'bottom',
      message,
      icon: appIcon('yes'),
    })
  }

  const loading = () => {
    isLoading.value = true
  }

  const finished = () => {
    isLoading.value = false
  }

  const setCurrentPageTable = (value) => {
    currentPageTable.value = value
  }

  return {
    isLoading,
    server,
    currentPageTable,
    scrollToElement,
    notifyError,
    notifySuccess,
    loading,
    finished,
    setCurrentPageTable,
  }
})
