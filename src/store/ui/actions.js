export function notifyError(context, message) {
  this._vm.$q.notify({
    color: 'negative',
    position: 'bottom',
    message,
    icon: 'mdi-alert-circle-outline'
  })
}
