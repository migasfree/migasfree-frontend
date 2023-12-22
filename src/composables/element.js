import { useGettext } from 'vue3-gettext'

const MAC_RAW_LEN = 12

const APP_ICON = {
  home: 'mdi-home',
  configuration: 'mdi-cogs',
  devices: 'mdi-printer-eye',
  release: 'mdi-truck-delivery',
  data: 'mdi-database-search',
  results: 'mdi-table-large',
  events: 'mdi-calendar-multiple',
  hardware: 'mdi-chip',
  simulate: 'mdi-head-sync-outline',
  replacement: 'mdi-compare-horizontal',
  compare: 'mdi-file-compare',
  information: 'mdi-information',
  password: 'mdi-account-key',
  permission: 'mdi-account-check',
  export: 'mdi-file-export',
}

const MODEL_ICON = {
  // configuration
  platforms: 'mdi-layers',
  projects: 'mdi-sitemap',
  formulas: 'mdi-function',
  singularities: 'mdi-function-variant',
  stamps: 'mdi-stamper',
  'attribute-sets': 'mdi-set-none',
  'fault-definitions': 'mdi-alert-octagram-outline',
  'user-profiles': 'mdi-account-cog',
  'accounts/groups': 'mdi-account-group',
  domains: 'mdi-web',
  scopes: 'mdi-eye-outline',

  // devices
  'devices/manufacturers': 'mdi-factory',
  'devices/models': 'mdi-shape',
  'devices/capabilities': 'mdi-format-list-bulleted-type',
  'devices/devices': 'mdi-printer',
  'devices/connections': 'mdi-connection',
  'devices/types': 'mdi-devices',
  'devices/logical': 'mdi-printer-settings',
  'devices/drivers': 'mdi-cog-transfer',

  // release
  deployments: 'mdi-rocket-launch',
  schedules: 'mdi-calendar-start',
  stores: 'mdi-store-24-hour',
  packages: 'mdi-package-variant',
  'package-sets': 'mdi-apps-box',
  'catalog/apps': 'mdi-apps',
  'catalog/categories': 'mdi-shape-outline',
  'catalog/policies': 'mdi-shield-half-full',

  // data
  computers: 'mdi-desktop-classic',
  'packages-history': 'mdi-history',
  users: 'mdi-account',
  attributes: 'mdi-pound',
  features: 'mdi-pound',
  tags: 'mdi-tag',
  syncs: 'mdi-sync',
  errors: 'mdi-bug',
  faults: 'mdi-bomb',
  'status-logs': 'mdi-flag-variant',
  migrations: 'mdi-map-marker-right',
  messages: 'mdi-message-text',
  notifications: 'mdi-android-messages',
}

export function appIcon(item) {
  if (item in APP_ICON) return APP_ICON[item]

  return ''
}

export function modelIcon(model) {
  if (model in MODEL_ICON) return MODEL_ICON[model]

  return ''
}

export function useElement() {
  const { $gettext } = useGettext()

  const elementIcon = (value) => {
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
  }

  const computerStatus = (value) => {
    switch (value) {
      case 'intended':
      case 'Intended':
        return $gettext('Intended')
      case 'available':
      case 'Available':
        return $gettext('Available')
      case 'in repair':
      case 'In repair':
        return $gettext('In repair')
      case 'reserved':
      case 'Reserved':
        return $gettext('Reserved')
      case 'unknown':
      case 'Unknown':
        return $gettext('Unknown')
      case 'unsubscribed':
      case 'Unsubscribed':
        return $gettext('Unsubscribed')
      default:
        return value
    }
  }

  const productIcon = (value) => {
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
  }

  const cpuIcon = (value) => {
    return `mdi-cpu-${value}-bit`
  }

  const chunk = (str, n) => {
    const ret = []

    for (let i = 0, len = str.length; i < len; i += n) {
      ret.push(str.substr(i, n))
    }

    return ret
  }

  const humanMacAddress = (value) => {
    if (!value) return ''

    const addresses = chunk(value, MAC_RAW_LEN)
    for (let i = 0; i < addresses.length; i++) {
      addresses[i] = chunk(addresses[i], 2).join(':')
    }
    return addresses.join(', ')
  }

  const attributeValue = (att) => {
    if (att.property_att.prefix === 'SET') return att.value
    if (att.property_att.prefix === 'CID') return att.description
    return `${att.property_att.prefix}-${att.value}`
  }

  const equivalentModel = (att) => {
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
  }

  const equivalentKey = (att) => {
    switch (att.property_att.prefix) {
      case 'CID':
        return parseInt(att.value)
      default:
        return 'pk' in att ? att.pk : att.id
    }
  }

  return {
    elementIcon,
    computerStatus,
    productIcon,
    cpuIcon,
    chunk,
    humanMacAddress,
    attributeValue,
    equivalentModel,
    equivalentKey,
  }
}
