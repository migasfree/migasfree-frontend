export const elementMixin = {
  methods: {
    elementIcon(status) {
      switch (status) {
        case 'intended':
          return 'mdi-heart-pulse'
        case 'available':
          return 'mdi-cart'
        case 'in repair':
          return 'mdi-wrench'
        case 'reserved':
          return 'mdi-lock-alert'
        case 'unknown':
          return 'mdi-crosshairs-question'
        case 'unsubscribed':
          return 'mdi-recycle-variant'
      }
    }
  }
}
