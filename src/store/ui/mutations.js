export function loading(state) {
  state.isLoading = true
}

export function finished(state) {
  state.isLoading = false
}

export function setCurrentPageTable(state, value) {
  state.currentPageTable = value
}
