import { useGettext } from 'vue3-gettext'

const MAC_RAW_LEN = 12
const MAC_SEGMENT_LEN = 2
const DEFAULT_ELEMENT_ICON = 'mdi-pound'
const DEFAULT_PRODUCT_ICON = 'mdi-help'

const ATTR_PREFIX = {
  SET: 'SET',
  CID: 'CID',
  DMN: 'DMN',
}

const PRODUCT_ICONS = {
  desktop: 'mdi-desktop-tower-monitor',
  laptop: 'mdi-laptop',
  virtual: 'mdi-cube-outline',
  docker: 'mdi-docker',
}

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
  regenerate: 'mdi-autorenew',
  replacement: 'mdi-compare-horizontal',
  compare: 'mdi-file-compare',
  information: 'mdi-information-outline',
  warning: 'mdi-alert-outline',
  error: 'mdi-alert-circle-outline',
  alert: 'mdi-bell',
  password: 'mdi-account-key',
  permission: 'mdi-account-check',
  export: 'mdi-file-export',
  add: 'mdi-plus',
  edit: 'mdi-pencil',
  delete: 'mdi-delete',
  download: 'mdi-download',
  filter: 'mdi-filter',
  'filter-remove': 'mdi-filter-remove',
  search: 'mdi-magnify',
  copy: 'mdi-content-copy',
  paste: 'mdi-content-paste',
  update: 'mdi-refresh',
  'save-edit': 'mdi-content-save-edit',
  save: 'mdi-content-save-move',
  language: 'mdi-earth',
  check: 'mdi-eye-check',
  uncheck: 'mdi-eye-remove',
  show: 'mdi-eye',
  hide: 'mdi-eye-off',
  doc: 'mdi-text-box-multiple',
  api: 'mdi-api',
  'source-code': 'mdi-github',
  copyright: 'mdi-copyright',
  organization: 'mdi-bank',
  yes: 'mdi-check-bold',
  no: 'mdi-close-thick',
  install: 'mdi-package-down',
  uninstall: 'mdi-package-up',
  logout: 'mdi-power-standby',
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
  notifications: 'mdi-comment-text-outline',
}

/**
 * Get application icon by name.
 *
 * @param {string} item - Icon identifier (e.g., 'home', 'add', 'delete')
 * @returns {string} Material Design Icon class name
 *
 * @example
 * appIcon('home') // "mdi-home"
 * appIcon('add') // "mdi-plus"
 */
export const appIcon = (item) => {
  if (item in APP_ICON) return APP_ICON[item]

  return ''
}

/**
 * Get icon for a data model.
 *
 * @param {string} model - Model path (e.g., 'computers', 'deployments')
 * @returns {string} Material Design Icon class name
 *
 * @example
 * modelIcon('computers') // "mdi-desktop-classic"
 * modelIcon('deployments') // "mdi-rocket-launch"
 */
export const modelIcon = (model) => {
  if (model in MODEL_ICON) return MODEL_ICON[model]

  return ''
}

/**
 * Composable for element utilities (icons, status, formatting).
 *
 * Provides functions for:
 * - Element status icons and translations
 * - Computer status translations
 * - Product type icons
 * - MAC address formatting
 * - Attribute value extraction
 *
 * @returns {Object} Element utilities
 *
 * @example
 * const { elementIcon, computerStatus, humanMacAddress } = useElement()
 * elementIcon('intended') // "mdi-heart-pulse"
 * computerStatus('reserved') // "Reserved" (translated)
 * humanMacAddress('001122334455') // "00:11:22:33:44:55"
 */
export const useElement = () => {
  const { $gettext } = useGettext()

  const ELEMENT_ICON = {
    intended: 'mdi-heart-pulse',
    available: 'mdi-cart',
    'in repair': 'mdi-wrench',
    reserved: 'mdi-lock-alert',
    unknown: 'mdi-crosshairs-question',
    unsubscribed: 'mdi-recycle-variant',
    SET: 'mdi-set-none',
    set: 'mdi-set-none',
    domain: 'mdi-web',
    tag: 'mdi-tag',
  }

  const STATUS_I18N = {
    intended: $gettext('Intended'),
    available: $gettext('Available'),
    'in repair': $gettext('In repair'),
    reserved: $gettext('Reserved'),
    unknown: $gettext('Unknown'),
    unsubscribed: $gettext('Unsubscribed'),
  }

  const elementIcon = (value) => {
    return ELEMENT_ICON[value] ?? DEFAULT_ELEMENT_ICON
  }

  const computerStatus = (value) => {
    const lowerValue = value.toLowerCase()
    return lowerValue && lowerValue in STATUS_I18N
      ? STATUS_I18N[lowerValue]
      : value
  }

  const productIcon = (value) => {
    return PRODUCT_ICONS[value] ?? DEFAULT_PRODUCT_ICON
  }

  const cpuIcon = (value) => {
    return `mdi-cpu-${value}-bit`
  }

  const chunk = (str, n) => str.match(new RegExp(`.{1,${n}}`, 'g')) || []

  const humanMacAddress = (value) => {
    if (!value) return ''

    const format = (s) =>
      s.match(new RegExp(`.{${MAC_SEGMENT_LEN}}`, 'g')).join(':')

    return chunk(value, MAC_RAW_LEN).map(format).join(', ')
  }

  const attributeValue = (att) => {
    if (att.property_att.prefix === ATTR_PREFIX.SET) return att.value
    if (att.property_att.prefix === ATTR_PREFIX.CID) return att.description

    return `${att.property_att.prefix}-${att.value}`
  }

  const equivalentModel = (att) => {
    switch (att.property_att.prefix) {
      case ATTR_PREFIX.SET:
        if (att.id > 1) return 'attribute-sets'
        return 'attributes'
      case ATTR_PREFIX.CID:
        return 'computers'
      case ATTR_PREFIX.DMN:
        return 'domains'
      default:
        if ('sort' in att.property_att && att.property_att.sort === 'server')
          return 'tags'
        return 'attributes'
    }
  }

  const equivalentKey = (att) => {
    switch (att.property_att.prefix) {
      case ATTR_PREFIX.CID:
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
