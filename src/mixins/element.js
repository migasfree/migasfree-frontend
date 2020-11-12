const MAC_RAW_LEN = 12

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
    },

    productIcon(value) {
      switch (value) {
        case 'desktop':
          return 'mdi-desktop-tower-monitor'
        case 'laptop':
          return 'mdi-laptop'
        case 'virtual':
          return 'mdi-cube-outline'
        case 'docker':
          return 'mdi-docker'
        default:
          return 'mdi-help'
      }
    },

    cpuIcon(value) {
      return `mdi-cpu-${value}-bit`
    },

    chunk(str, n) {
      const ret = []

      for (let i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n))
      }

      return ret
    },

    humanMacAddress(value) {
      if (!value) return ''

      const addresses = this.chunk(value, MAC_RAW_LEN)
      for (let i = 0; i < addresses.length; i++) {
          addresses[i] = this.chunk(addresses[i], 2).join(':')
      }
      return addresses.join(', ')
    }
  }
}
