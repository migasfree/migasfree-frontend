const MAC_RAW_LEN = 12

export const elementMixin = {
  methods: {
    elementIcon(value) {
      switch (value) {
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
        case 'SET':
        case 'set':
          return 'mdi-set-none'
        case 'domain':
          return 'mdi-web'
        case 'tag':
          return 'mdi-tag'
        default:
          return 'mdi-pound'
      }
    },

    computerStatus(value) {
      switch (value) {
        case 'intended':
        case 'Intended':
          return this.$gettext('Intended')
        case 'available':
        case 'Available':
          return this.$gettext('Available')
        case 'in repair':
        case 'In repair':
          return this.$gettext('In repair')
        case 'reserved':
        case 'Reserved':
          return this.$gettext('Reserved')
        case 'unknown':
        case 'Unknown':
          return this.$gettext('Unknown')
        case 'unsubscribed':
        case 'Unsubscribed':
          return this.$gettext('Unsubscribed')
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
    },

    attributeValue(att) {
      if (att.property_att.prefix === 'SET') return att.value
      if (att.property_att.prefix === 'CID') return att.description
      return `${att.property_att.prefix}-${att.value}`
    },

    equivalentModel(att) {
      switch (att.property_att.prefix) {
        case 'SET':
          if (att.id > 1) return 'attribute-sets'
          return 'attributes'
        case 'CID':
          return 'computers'
        case 'DMN':
          return 'domains'
        default:
          if ('sort' in att.property_att && att.property_att.sort === 'server')
            return 'tags'
          return 'attributes'
      }
    },

    equivalentKey(att) {
      switch (att.property_att.prefix) {
        case 'CID':
          return parseInt(att.value)
        default:
          return 'pk' in att ? att.pk : att.id
      }
    },
  },
}
