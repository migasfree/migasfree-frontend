import { ref } from 'vue'
import { defineStore } from 'pinia'
import { scroll, Notify } from 'quasar'

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const currentPageTable = ref(1)
  const server = ref(process.env.MIGASFREE_SERVER || 'http://localhost')

  function scrollToElement(element) {
    const target = scroll.getScrollTarget(element)
    const offset = element.offsetTop
    const duration = 1000

    scroll.setVerticalScrollPosition(target, offset, duration)
  }

  function notifyError(error) {
    let message = ''

    // Setup Error Message
    if (typeof error !== 'undefined') {
      if (error.hasOwnProperty('message')) {
        message = error.message
      }
    }

    if (typeof error.response !== 'undefined') {
      // Setup Generic Response Messages
      if (error.response.status === 401) {
        message = 'UnAuthorized'
        // vm.$emit('logout') // Emit Logout Event
      } else if (error.response.status === 404) {
        message = 'API Route is Missing or Undefined'
      } else if (error.response.status === 405) {
        message = 'API Route Method Not Allowed'
      } else if (error.response.status === 422) {
        // Validation Message
      } else if (error.response.status >= 500) {
        message = 'Server Error'
      }

      // Try to Use the Response Message
      if (
        error.hasOwnProperty('response') &&
        error.response.hasOwnProperty('data') &&
        typeof error.response.data !== 'undefined'
      ) {
        if (typeof error.response.data === 'string') {
          message = error.response.data
        } else if (Object.keys(error.response.data).length > 0) {
          message = error.response.data[Object.keys(error.response.data)[0]]
        }
      }
    }

    if (typeof error === 'string') {
      message = error
    }

    Notify.create({
      color: 'negative',
      position: 'bottom',
      message,
      icon: 'mdi-alert-circle-outline',
    })
  }

  function notifySuccess(message) {
    Notify.create({
      color: 'positive',
      position: 'bottom',
      message,
      icon: 'mdi-check-bold',
    })
  }

  function loading() {
    isLoading.value = true
  }

  function finished() {
    isLoading.value = false
  }

  function setCurrentPageTable(value) {
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
