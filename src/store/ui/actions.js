import { scroll } from 'quasar'

const { getScrollTarget, setScrollPosition } = scroll

export function scrollToElement(context, element) {
  const target = getScrollTarget(element)
  const offset = element.offsetTop
  const duration = 1000

  setScrollPosition(target, offset, duration)
}

export function notifyError(context, error) {
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
      error.response.hasOwnProperty('data')
    ) {
      if (Object.keys(error.response.data).length > 0) {
        message = error.response.data[Object.keys(error.response.data)[0]]
      }
    }
  }

  if (typeof error === 'string') {
    message = error
  }

  this._vm.$q.notify({
    color: 'negative',
    position: 'bottom',
    message,
    icon: 'mdi-alert-circle-outline'
  })
}

export function notifySuccess(context, message) {
  this._vm.$q.notify({
    color: 'positive',
    position: 'bottom',
    message,
    icon: 'mdi-check-bold'
  })
}
