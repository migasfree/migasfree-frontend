export function loading(state) {
  state.isLoading = true
}

export function finished(state) {
  state.isLoading = false
}
