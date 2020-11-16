export function notifyError(context, message) {
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
