import {
  ref,
  computed,
  reactive,
  watch,
  onMounted,
  getCurrentInstance,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import _merge from 'lodash/merge.js'

import { useAuthStore } from 'stores/auth'
import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'
import { RESULTS_PER_PAGE } from 'config/app.conf'

const defaultColumns = []
const defaultModel = ref('')
const defaultDetailRoute = ref('')
const defaultColumnParams = reactive({})

export default function useDataGrid(
  columns = defaultColumns,
  model = defaultModel,
  detailRoute = defaultDetailRoute,
  columnParams = defaultColumnParams,
) {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  const route = useRoute()
  const router = useRouter()
  const { $gettext, interpolate } = useGettext()
  const $q = useQuasar()
  const { emit } = getCurrentInstance()

  const myTable = ref(null)
  const machineTree = ref(null)
  const statusTree = ref(null)
  const createdAtRange = ref(null)
  const startDateRange = ref(null)
  const installDateRange = ref(null)
  const uninstallDateRange = ref(null)

  const perPage = RESULTS_PER_PAGE
  const rows = ref([])
  const totalRecords = ref(0)
  const isLoading = ref(false)
  const isLoadingExport = ref(false)
  const paginationOptions = reactive({
    enabled: true,
    mode: 'records',
    perPage,
    perPageDropdown: [10, 50, 100, 150],
    dropdownAllowAll: false,
    nextLabel: $gettext('Next'),
    prevLabel: $gettext('Previous'),
    rowsPerPageLabel: $gettext('Results per page'),
    ofLabel: $gettext('of'),
    pageLabel: $gettext('page'), // for 'pages' mode
    allLabel: $gettext('View All'),
  })
  const serverParams = reactive({
    columnFilters: {},
    sort: {
      field: '',
      type: '',
    },
    page: 1,
    perPage,
  })
  const selectOptions = reactive({
    enabled: true,
    selectOnCheckboxOnly: true,
    selectionText: $gettext('rows selected'),
    clearSelectionText: $gettext('Clear'),
  })

  const ALL_OPTION = { id: '', name: $gettext('All') }

  const simpleFilter = (extra = []) => ({
    items: [ALL_OPTION, ...extra],
    selected: null,
  })

  const rangeFilter = () => ({
    selected: { from: null, to: null },
  })

  const bitsOption = (n) => ({
    id: n,
    name: interpolate($gettext('%{n} bits'), { n }),
  })

  const daysAgoOption = (n) => ({
    id: n,
    name: interpolate($gettext('%{n} days ago'), { n }),
  })

  const tableFilters = reactive({
    search: '',
    platform: simpleFilter(),
    project: simpleFilter(),
    statusIn: {
      items: [],
      selected: null,
      choices: {},
    },
    createdAtRange: rangeFilter(),
    startDateRange: rangeFilter(),
    schedule: {
      items: [
        ALL_OPTION,
        { id: 1, name: $gettext('without schedule') },
        { id: 0, name: $gettext('with schedule') },
      ],
      selected: null,
    },
    model: simpleFilter(),
    installDateRange: rangeFilter(),
    uninstallDateRange: rangeFilter(),
    uninstallDate: {
      items: [
        ALL_OPTION,
        { id: 1, name: $gettext('without date') },
        { id: 0, name: $gettext('with date') },
      ],
      selected: null,
    },
    user: simpleFilter(),
    serial: '',
    mac: '',
    uuid: '',
    architecture: {
      items: [ALL_OPTION, bitsOption(32), bitsOption(64)],
      selected: null,
    },
    machine: {
      items: [
        ALL_OPTION,
        {
          id: 'P',
          label: $gettext('Physical'),
          children: [
            { id: 'desktop', label: $gettext('desktop') },
            { id: 'laptop', label: $gettext('laptop') },
          ],
        },
        {
          id: 'V',
          label: $gettext('Virtual'),
          children: [
            { id: 'virtual', label: $gettext('emulator') },
            { id: 'docker', label: $gettext('container') },
          ],
        },
      ],
      selected: null,
    },
    syncEndDate: {
      items: [
        ALL_OPTION,
        { id: 0, name: $gettext('without date') },
        daysAgoOption(7),
        daysAgoOption(30),
        daysAgoOption(60),
        daysAgoOption(180),
        daysAgoOption(365),
      ],
      selected: null,
    },
    softwareInventory: {
      items: [
        ALL_OPTION,
        { id: 0, name: $gettext('without inventory') },
        { id: 1, name: $gettext('with inventory') },
      ],
      selected: null,
    },
    syncEndDateRange: rangeFilter(),
  })

  const selectedRows = ref([])

  const searchOptions = computed(() => {
    return {
      enabled: true,
      skipDiacritics: true,
      externalQuery: tableFilters.search,
    }
  })

  const loadQueryParams = () => {
    const keyMap = {
      capability_id: { filterKey: 'capability.name' },
      category: { filterKey: 'category.name' },
      category_id: { filterKey: 'category.name' },
      connection_id: { filterKey: 'connection.name' },
      device_type_id: { filterKey: 'device_type.name' },
      fault_definition_id: { filterKey: 'fault_definition.name' },
      level: { filterKey: 'level.name' },
      model_id: { filterKey: 'model.name' },
      package_project_id: {
        columnKey: 'package.project.name',
        filterKey: 'package.project.name',
      },
      platform_id: { columnKey: 'platform', filterKey: 'platform.name' },
      project_id: { columnKey: 'project.name', filterKey: 'project.name' },
      property_id: { columnKey: 'property_att', filterKey: 'property_att' },
      schedule_id: { filterKey: 'schedule.name' },
      store_id: { columnKey: 'store.name', filterKey: 'store.name' },
    }

    Object.entries(route.query).map(([key, rawValue]) => {
      const value =
        typeof rawValue === 'boolean' ? rawValue.toString() : rawValue

      const { columnKey, filterKey } = keyMap[key] || {}

      updateParams({
        columnFilters: { [columnKey ?? key]: value },
      })

      const columnField =
        key === 'manufacturer_id'
          ? (x) =>
              x.field === 'manufacturer.name' ||
              x.field === 'model.manufacturer.name'
          : (x) => x.field === (filterKey ?? key)

      const filter = columns.find(columnField)
      if (filter && 'filterOptions' in filter) {
        filter.filterOptions.filterValue = value
      }

      // Table filter handling
      if (key in tableFilters) {
        // Special cases that require ID search
        if (key === 'machine') {
          const item = findById(tableFilters.machine.items, value)
          if (item) tableFilters.machine.selected = item.label
        } else if (key === 'schedule') {
          const item = findById(
            tableFilters.schedule.items,
            value === 'true' ? 1 : value === 'false' ? 0 : '',
          )
          if (item) tableFilters.schedule.selected = item.name
        } else if (key === 'user') {
          const item = findById(tableFilters.user.items, value)
          if (item) tableFilters.user.selected = item.name
        } else {
          // Generic filters
          if (typeof tableFilters[key] === 'object')
            tableFilters[key].selected = value
          else tableFilters[key] = value
        }
      }

      // special cases
      if ('createdAtRange' in tableFilters) {
        if (key === 'created_at__gte')
          tableFilters.createdAtRange.selected.from = value

        if (key === 'created_at__lt')
          tableFilters.createdAtRange.selected.to = value
      }

      if (key === 'uninstall_date' && 'uninstallDate' in tableFilters) {
        const item = findById(
          tableFilters.uninstallDate.items,
          value === 'true' ? 1 : value === 'false' ? 0 : '',
        )
        if (item) tableFilters.uninstallDate.selected = filter.name
      }
    })
  }

  const findById = (data, id) => {
    return data.reduce((a, item) => {
      if (a) return a
      if (item.id === id) return item
      if (item.children) return findById(item.children, id)
    }, null)
  }

  const updateParams = (newProps) => {
    serverParams.value = _merge(serverParams, newProps)
    if (!('page' in newProps)) {
      serverParams.page = 1
      paginationOptions.setCurrentPage = 1
      uiStore.setCurrentPageTable(1)
    }
  }

  const resetColumnFilters = () => {
    serverParams.columnFilters = {}
  }

  const onPageChange = (params) => {
    updateParams({ page: params.currentPage })
    uiStore.setCurrentPageTable(params.currentPage)
    loadItems()
  }

  const onPerPageChange = (params) => {
    updateParams({ perPage: params.currentPerPage })
    loadItems()
  }

  const onSortChange = (params) => {
    updateParams({
      sort: {
        type: params[0].type === 'desc' ? '-' : '',
        field: params[0].field.split('.')[0],
      },
    })
    loadItems()
  }

  const onColumnFilter = (params) => {
    updateParams(params)
    loadItems()
  }

  const onSelectionChanged = (params) => {
    selectedRows.value = params.selectedRows
  }

  const onSearch = () => {
    updateParams({
      columnFilters: { search: tableFilters.search },
    })
    loadItems()
  }

  const onSearchClear = () => {
    tableFilters.search = ''
    onSearch()
  }

  const onPlatformFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        platform: params.id,
      }),
    })
    loadItems()
  }

  const onProjectFilter = (params) => {
    if (model.value === 'catalog/apps') {
      updateParams({
        columnFilters: Object.assign(serverParams.columnFilters, {
          packages_by_project_project_id: params.id,
        }),
      })
    }
    if (model.value === 'devices/models') {
      updateParams({
        columnFilters: Object.assign(serverParams.columnFilters, {
          drivers_project_id: params.id,
        }),
      })
    }
    loadItems()
  }

  const onUserFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        user: params.id,
      }),
    })
    loadItems()
  }

  const onCreatedAtRangeFilter = (params) => {
    tableFilters.createdAtRange.selected = params
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        created_at__gte: tableFilters.createdAtRange.selected.from,
        created_at__lt: tableFilters.createdAtRange.selected.to,
      }),
    })
    loadItems()
  }

  const onStartDateRangeFilter = (params) => {
    tableFilters.startDateRange.selected = params
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        start_date__gte: tableFilters.startDateRange.selected.from,
        start_date__lt: tableFilters.startDateRange.selected.to,
      }),
    })
    loadItems()
  }

  const onScheduleFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        schedule: params.id ? true : params.id === 0 ? false : '',
      }),
    })
    loadItems()
  }

  const onModelFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        model: params.id,
      }),
    })
    loadItems()
  }

  const onStatusInFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        status_in: params.id,
      }),
    })
    loadItems()
  }

  const updateStatusInFilter = (options) => {
    tableFilters.statusIn.choices = options.choices

    tableFilters.statusIn.items = [
      ALL_OPTION,
      {
        id: options.subscribed.join(','),
        label: $gettext('subscribed'),
        children: [
          {
            id: options.productive.join(','),
            label: $gettext('productive'),
            children: Object.entries(options.productive).map(([, val]) => {
              return { id: val, label: options.choices[val] }
            }),
          },
          {
            id: options.unproductive.join(','),
            label: $gettext('unproductive'),
            children: Object.entries(options.unproductive).map(([, val]) => {
              return { id: val, label: options.choices[val] }
            }),
          },
        ],
      },
      {
        id: options.unsubscribed.join(','),
        label: $gettext('unsubscribed'),
      },
    ]

    if (route.query.status_in) {
      const selected = findById(
        tableFilters.statusIn.items,
        route.query.status_in,
      )
      if (selected) tableFilters.statusIn.selected = selected.label
    }
  }

  const onInstallDateRangeFilter = (params) => {
    tableFilters.installDateRange.selected = params
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        install_date__gte: tableFilters.installDateRange.selected.from
          ? tableFilters.installDateRange.selected.from + 'T00:00:00'
          : '',
        install_date__lt: tableFilters.installDateRange.selected.to
          ? tableFilters.installDateRange.selected.to + 'T23:59:59'
          : '',
      }),
    })
    loadItems()
  }

  const onUninstallDateRangeFilter = (params) => {
    tableFilters.uninstallDateRange.selected = params
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        uninstall_date__gte: tableFilters.uninstallDateRange.selected.from
          ? tableFilters.uninstallDateRange.selected.from + 'T00:00:00'
          : '',
        uninstall_date__lt: tableFilters.uninstallDateRange.selected.to
          ? tableFilters.uninstallDateRange.selected.to + 'T23:59:59'
          : '',
      }),
    })
    loadItems()
  }

  const onUninstallDateFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        uninstall_date: params.id ? true : params.id === 0 ? false : '',
      }),
    })
    loadItems()
  }

  const onArchitectureFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        architecture: params.id,
      }),
    })
    loadItems()
  }

  const onMachineFilter = (params) => {
    if (params.id === '' || params.id === 'P' || params.id === 'V') {
      updateParams({
        columnFilters: Object.assign(serverParams.columnFilters, {
          machine: params.id,
          product_system: '',
        }),
      })
    } else {
      updateParams({
        columnFilters: Object.assign(serverParams.columnFilters, {
          machine: '',
          product_system: params.id,
        }),
      })
    }
    loadItems()
  }

  const onSoftwareInventoryFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        has_software_inventory:
          params.id === 0 ? false : params.id === 1 ? true : '',
      }),
    })
    loadItems()
  }

  const onSyncEndDateFilter = (params) => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        sync_end_date: params.id,
      }),
    })
    loadItems()
  }

  const onSyncEndDateRangeFilter = (params) => {
    tableFilters.syncEndDateRange.selected = params
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        sync_end_date__gte: tableFilters.syncEndDateRange.selected.from
          ? tableFilters.syncEndDateRange.selected.from + 'T00:00:00'
          : '',
        sync_end_date__lt: tableFilters.syncEndDateRange.selected.to
          ? tableFilters.syncEndDateRange.selected.to + 'T23:59:59'
          : '',
      }),
    })
    loadItems()
  }

  const onSerialFilter = () => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        serial: tableFilters.serial,
      }),
    })
    loadItems()
  }

  const onMacFilter = () => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        mac: tableFilters.mac,
      }),
    })
    loadItems()
  }

  const onUuidFilter = () => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        uuid: tableFilters.uuid,
      }),
    })
    loadItems()
  }

  const queryParams = () => {
    const ret = {
      page_size: serverParams.perPage,
      page: serverParams.page,
    }

    if (serverParams.sort.field) {
      ret.ordering = `${serverParams.sort.type}${serverParams.sort.field}`
    }

    const fieldMap = {
      // ---- direct maps ----
      application_id: 'application__id',
      attribute_id: 'attribute__id',
      attributes_id: 'attributes__id',
      attributeset_included_id: 'attributeset_included__id',
      attributeset_excluded_id: 'attributeset_excluded__id',
      available_for_attributes_id: 'available_for_attributes__id',
      available_packages_id: 'available_packages__id',
      available_package_sets_id: 'available_package_sets__id',
      capability_id: 'capability__id',
      'capability.name': 'capability__id',
      category: 'category__id',
      category_id: 'category__id',
      'category.name': 'category__id',
      'computer.__str__': 'computer__name__icontains',
      computer_id: 'computer__id',
      connections_id: 'connections__id',
      'connection.name': 'connection__id',
      default_logical_device_id: 'default_logical_device__id',
      deployment: 'deployment__isnull',
      deployment_id: 'deployment__id',
      deployment_included_id: 'deployment_included__id',
      deployment_excluded_id: 'deployment_excluded__id',
      device_id: 'device__id',
      device_type_id: 'device_type__id',
      'device_type.name': 'device_type__id',
      domain_included_id: 'domain_included__id',
      domain_excluded_id: 'domain_excluded__id',
      domain_tags_id: 'domain_tags__id',
      domains_id: 'domains__id',
      drivers_project_id: 'drivers__project__id',
      excluded_attributes_id: 'excluded_attributes__id',
      faultdefinition_id: 'faultdefinition__id',
      faultdefinition_included_id: 'faultdefinition_included__id',
      faultdefinition_excluded_id: 'faultdefinition_excluded__id',
      faultdefinition_users_id: 'faultdefinition_users__id',
      'fault_definition.name': 'fault_definition_id',
      id_in: 'id__in',
      included_attributes_id: 'included_attributes__id',
      level: 'level',
      'level.name': 'level',
      logical_id: 'logical__id',
      'manufacturer.name': 'manufacturer__id',
      model: 'device__model__id',
      'model.manufacturer.name': 'model__manufacturer__id',
      model_id: 'model__id',
      'model.name': 'model__id',
      'package.project.name': 'package__project__id',
      package_id: 'package__id',
      packages: 'packages__isnull',
      packages_id: 'packages__id',
      packageset: 'packageset__isnull',
      packageset_id: 'packageset__id',
      packages_by_project_project_id: 'packages_by_project__project__id',
      'platform.name': 'platform__id',
      policy_included_id: 'policy_included__id',
      policy_excluded_id: 'policy_excluded__id',
      project_id: 'project__id',
      'project.name': 'project__id',
      property_att: 'property_att__id',
      schedule: 'schedule__isnull',
      schedule_id: 'schedule__id',
      'schedule.name': 'schedule__id',
      singularity_id: 'singularity__id',
      singularity_included_id: 'singularity_included__id',
      singularity_excluded_id: 'singularity_excluded__id',
      scope_included_id: 'scope_included__id',
      scope_excluded_id: 'scope_excluded__id',
      store: 'store__isnull',
      'store.name': 'store__id',
      sync_attributes_id: 'sync_attributes__id',
      sync_attributes_id_in: 'sync_attributes__id__in',
      sync_user_id: 'sync_user__id',
      tags_id: 'tags__id',
      uninstall_date: 'uninstall_date__isnull',
      user_id: 'user__id',
      users_id: 'users__id',
      // ---- cases with own logic ----
      platform: (_key, val) => {
        if (model.value === 'computers') return { ['platform']: val }
        if (model.value === 'projects') return { platform__id: val }
        return { project__platform__id: val }
      },
      status: (_key, val) => ({
        ...(model.value === 'computers' || model.value === 'status-logs'
          ? { status__in: val }
          : { computer__status__in: val }),
      }),
      status_in: (_key, val) => ({
        ...(model.value === 'computers' || model.value === 'status-logs'
          ? { status__in: val }
          : { computer__status__in: val }),
      }),
      status__in: (_key, val) => ({
        ...(model.value === 'computers' || model.value === 'status-logs'
          ? { status__in: val }
          : { computer__status__in: val }),
      }),
      mac: (_key, val) => ({
        mac_address: typeof val === 'string' ? val.replaceAll(':', '') : val,
      }),
      sync_end_date: (_key, val) => {
        if (val === 0) return { sync_end_date__isnull: true }
        const d = new Date()
        d.setDate(d.getDate() - val)
        return { sync_end_date__lt: d.toISOString() }
      },
      // ---- generic filters ----
      __default: (key, val) => {
        // console.log('default', key, val)
        if (typeof key !== 'string' || key === '') return {}

        const specialCases = [
          'architecture',
          'auto_register_computers',
          'checked',
          'enabled',
          'exclusive',
          'has_software_inventory',
          'installed_package',
          'is_active',
          'kind',
          'language',
          'machine',
          'page',
          'page_size',
          'pms_status_ok',
          'product_system',
          'search',
          'serial',
          'score',
          'source',
          'sort',
          'total_computers',
          'user',
          'platform_id',
        ]

        // operators who should **not** receive __icontains
        const rangeOperators = [
          '__gte',
          '__gt',
          '__lte',
          '__lt',
          '__in',
          '__isnull',
        ]
        const hasRangeOperator = rangeOperators.some((op) => key.endsWith(op))

        // if it has any of those operators or in specialCases, we return the key as is
        if (hasRangeOperator || specialCases.includes(key)) {
          // console.log('no icontains', { [key]: val })
          return { [key]: val }
        }

        // generic case
        const paramName = `${key.replace(/\./g, '__')}__icontains`
        return { [paramName]: val }
      },
    }

    //  Apply filters
    if (Object.keys(serverParams.columnFilters).length) {
      Object.entries(serverParams.columnFilters).forEach(([key, val]) => {
        // console.log('apply filter', key, val)
        const mapper = fieldMap[key] ?? fieldMap.__default
        // console.log(mapper)
        if (typeof mapper === 'function') {
          Object.assign(ret, mapper(key, val))
        } else {
          ret[mapper] = val
        }
      })
    }

    return ret
  }

  const loadItems = async () => {
    if (isLoading.value) return

    isLoading.value = true
    await api
      .get(`/api/v1/token/${model.value}/`, { params: queryParams() })
      .then((response) => {
        totalRecords.value = response.data.count
        rows.value = response.data.results
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
      .finally(() => (isLoading.value = false))
  }

  const edit = (id) => {
    router.push({ name: detailRoute.value, params: { id } })
  }

  const remove = (id, reload = true) => {
    api
      .delete(`/api/v1/token/${model.value}/${id}/`)
      .then(() => {
        emit('postRemove', id)
        uiStore.notifySuccess($gettext('Item deleted!'))
        if (reload) loadItems()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const confirmRemove = (id) => {
    let items = []
    let message = $gettext('Are you sure you want to remove this item?')

    if (typeof id === 'number' && id > 0) {
      items.push(id)
    } else {
      message = $gettext('Are you sure you want to remove all these items?')
      items = selectedRows.value.map((item) => item.id)
    }

    if (items.length === 0) return

    $q.dialog({
      message,
      ok: {
        color: 'negative',
        label: $gettext('Delete'),
        icon: 'mdi-delete',
      },
      cancel: {
        flat: true,
        label: $gettext('Cancel'),
      },
      persistent: true,
    }).onOk(() => {
      items.forEach((id) => {
        remove(id, items[items.length - 1] === id)
      })
    })
  }

  const _export = (url, params = {}) => {
    isLoadingExport.value = true
    api
      .get(url, {
        params,
        responseType: 'blob',
      })
      .then((response) => {
        let fileURL = window.URL.createObjectURL(new Blob([response.data]))
        let fileLink = document.createElement('a')

        fileLink.href = fileURL
        fileLink.setAttribute('download', `${model.value}.csv`)
        document.body.appendChild(fileLink)

        fileLink.click()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
      .finally(() => {
        isLoadingExport.value = false
      })
  }

  const exportData = () => {
    const items = selectedRows.value.map((item) => item.id)

    if (items.length === 0) return

    _export(`/api/v1/token/${model.value}/export/?id__in=${items.join(',')}`)
  }

  const paramsToBackend = (obj) => {
    const ret = {}
    Object.entries(obj).map(([key, val]) => {
      const lastUnderscore = key.lastIndexOf('_')
      if (lastUnderscore > 0) {
        const newKey = `${key.substring(0, lastUnderscore)}__${key.substring(
          lastUnderscore + 1,
        )}`
        ret[newKey] = val
      } else ret[key] = val
    })

    return ret
  }

  const exportAll = () => {
    const params = paramsToBackend(route.query)
    Object.assign(params, queryParams())
    delete params.page
    delete params.page_size

    _export(`/api/v1/token/${model.value}/export/`, params)
  }

  const updateChecked = (id, value, reload = true) => {
    api
      .patch(`/api/v1/token/${model.value}/${id}/`, { checked: value })
      .then(() => {
        uiStore.notifySuccess($gettext('Changed item check value!'))
        if (reload) loadItems()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const updateItemsChecked = (value) => {
    const items = selectedRows.value.map((item) => item.id)
    if (items.length === 0) return

    items.forEach((id) => {
      updateChecked(id, value, items[items.length - 1] === id)
    })
  }

  const updateEnabled = (id, value, reload = true) => {
    let data = { enabled: value }
    if (model.value === 'user-profiles') data = { is_active: value }

    api
      .patch(`/api/v1/token/${model.value}/${id}/`, data)
      .then(() => {
        uiStore.notifySuccess($gettext('Changed item enable value!'))
        if (reload) loadItems()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const updateItemsEnabled = (value) => {
    const items = selectedRows.value.map((item) => item.id)
    if (items.length === 0) return

    items.forEach((id) => {
      updateEnabled(id, value, items[items.length - 1] === id)
    })
  }

  const regenerateMetadata = async (id) => {
    await api
      .get(`/api/v1/token/${model.value}/internal-sources/${id}/metadata/`)
      .then((response) => {
        uiStore.notifySuccess(response.data.detail)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const resetFilters = (loadItemsAfter = true) => {
    myTable.value.reset()
    resetColumnFilters()

    const rangeFilters = [
      'createdAtRange',
      'installDateRange',
      'startDateRange',
      'syncEndDateRange',
      'uninstallDateRange',
    ]

    const textFilters = ['serial', 'mac', 'uuid', 'search']

    Object.entries(tableFilters).forEach(([key]) => {
      if (rangeFilters.includes(key)) {
        tableFilters[key] = rangeFilter()
        const rangeRef = {
          installDateRange,
          uninstallDateRange,
          createdAtRange,
          startDateRange,
        }[key]
        if (rangeRef?.value) rangeRef.value.reset(loadItemsAfter)
      } else if (textFilters.includes(key)) {
        tableFilters[key] = ''
      } else if (key === 'machine' && machineTree.value) {
        machineTree.value.reset()
      } else if (key === 'statusIn' && statusTree.value) {
        statusTree.value.reset()
      } else {
        tableFilters[key].selected = null
      }
    })

    if (loadItemsAfter) loadItems()
  }

  watch(route, () => {
    resetFilters(false)
    loadQueryParams()
    loadItems()
  })

  onMounted(async () => {
    await loadItems()
  })

  // created
  loadQueryParams()
  if (Object.keys(columnParams.value).length > 0) {
    updateParams(columnParams.value)
  }
  if (model === 'scopes' && !authStore.user.is_superuser) {
    updateParams({
      columnFilters: { user: authStore.user.pk },
    })
  }
  // end created

  return {
    myTable,
    machineTree,
    statusTree,
    createdAtRange,
    startDateRange,
    installDateRange,
    uninstallDateRange,
    rows,
    totalRecords,
    isLoading,
    isLoadingExport,
    paginationOptions,
    serverParams,
    selectOptions,
    tableFilters,
    selectedRows,
    searchOptions,
    loadQueryParams,
    findById,
    updateParams,
    resetColumnFilters,
    onPageChange,
    onPerPageChange,
    onSortChange,
    onColumnFilter,
    onSelectionChanged,
    onSearch,
    onSearchClear,
    onPlatformFilter,
    onProjectFilter,
    onUserFilter,
    onCreatedAtRangeFilter,
    onStartDateRangeFilter,
    onScheduleFilter,
    onModelFilter,
    onStatusInFilter,
    updateStatusInFilter,
    onInstallDateRangeFilter,
    onUninstallDateRangeFilter,
    onUninstallDateFilter,
    onArchitectureFilter,
    onMachineFilter,
    onSoftwareInventoryFilter,
    onSyncEndDateFilter,
    onSyncEndDateRangeFilter,
    onSerialFilter,
    onMacFilter,
    onUuidFilter,
    queryParams,
    loadItems,
    edit,
    remove,
    confirmRemove,
    exportData,
    exportAll,
    updateChecked,
    updateItemsChecked,
    updateEnabled,
    updateItemsEnabled,
    regenerateMetadata,
    resetFilters,
  }
}
