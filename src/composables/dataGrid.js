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
import _merge from 'lodash/merge'

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
  const tableFilters = reactive({
    search: '',
    platform: {
      items: [{ id: '', name: $gettext('All') }],
      selected: null,
    },
    project: {
      items: [{ id: '', name: $gettext('All') }],
      selected: null,
    },
    statusIn: {
      items: [],
      selected: null,
      choices: {},
    },
    createdAtRange: {
      selected: { from: null, to: null },
    },
    startDateRange: {
      selected: { from: null, to: null },
    },
    schedule: {
      items: [
        { id: '', name: $gettext('All') },
        { id: 1, name: $gettext('without schedule') },
        { id: 0, name: $gettext('with schedule') },
      ],
      selected: null,
    },
    model: {
      items: [{ id: '', name: $gettext('All') }],
      selected: null,
    },
    installDateRange: {
      selected: { from: null, to: null },
    },
    uninstallDateRange: {
      selected: { from: null, to: null },
    },
    uninstallDate: {
      items: [
        { id: '', name: $gettext('All') },
        { id: 1, name: $gettext('without date') },
        { id: 0, name: $gettext('with date') },
      ],
      selected: null,
    },
    user: {
      items: [{ id: '', name: $gettext('All') }],
      selected: null,
    },
    serial: '',
    uuid: '',
    architecture: {
      items: [
        { id: '', name: $gettext('All') },
        {
          id: 32,
          name: interpolate($gettext('%{n} bits'), {
            n: 32,
          }),
        },
        {
          id: 64,
          name: interpolate($gettext('%{n} bits'), {
            n: 64,
          }),
        },
      ],
      selected: null,
    },
    machine: {
      items: [
        { id: '', label: $gettext('All') },
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
        { id: '', name: $gettext('All') },
        { id: 0, name: $gettext('without date') },
        {
          id: 7,
          name: interpolate($gettext('%{n} days ago'), {
            n: 7,
          }),
        },
        {
          id: 30,
          name: interpolate($gettext('%{n} days ago'), {
            n: 30,
          }),
        },
        {
          id: 60,
          name: interpolate($gettext('%{n} days ago'), {
            n: 60,
          }),
        },
        {
          id: 180,
          name: interpolate($gettext('%{n} days ago'), {
            n: 180,
          }),
        },
        {
          id: 365,
          name: interpolate($gettext('%{n} days ago'), {
            n: 365,
          }),
        },
      ],
      selected: null,
    },
    softwareInventory: {
      items: [
        { id: '', name: $gettext('All') },
        { id: 0, name: $gettext('without inventory') },
        { id: 1, name: $gettext('with inventory') },
      ],
      selected: null,
    },
    syncEndDateRange: {
      selected: { from: null, to: null },
    },
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
    Object.entries(route.query).map(([key, value]) => {
      let columnKey = null
      let filterKey = null

      if (typeof value === 'boolean') value = value.toString()

      switch (key) {
        case 'capability_id':
          filterKey = 'capability.name'
          break
        case 'category':
        case 'category_id':
          filterKey = 'category.name'
          break
        case 'connection_id':
          filterKey = 'connection.name'
          break
        case 'device_type_id':
          filterKey = 'device_type.name'
          break
        case 'fault_definition_id':
          filterKey = 'fault_definition.name'
          break
        case 'level':
          filterKey = 'level.name'
          break
        case 'model_id':
          filterKey = 'model.name'
          break
        case 'package_project_id':
          columnKey = 'package.project.name'
          filterKey = 'package.project.name'
          break
        case 'platform_id':
          columnKey = 'platform'
          filterKey = 'platform.name'
          break
        case 'project_id':
          columnKey = 'project.name'
          filterKey = 'project.name'
          break
        case 'property_id':
          columnKey = 'property_att'
          filterKey = 'property_att'
          break
        case 'schedule_id':
          filterKey = 'schedule.name'
          break
        case 'store_id':
          columnKey = 'store.name'
          filterKey = 'store.name'
          break
      }

      updateParams({
        columnFilters: { [columnKey ? columnKey : key]: value },
      })

      let filter = null
      if (key === 'manufacturer_id')
        filter = columns.find(
          (x) =>
            x.field === 'manufacturer.name' ||
            x.field === 'model.manufacturer.name',
        )
      else
        filter = columns.find((x) => x.field === (filterKey ? filterKey : key))
      if (filter && 'filterOptions' in filter)
        filter.filterOptions.filterValue = value

      filter = null
      if (key in tableFilters) {
        switch (key) {
          case 'machine':
            filter = findById(tableFilters.machine.items, value)
            if (filter) tableFilters.machine.selected = filter.label
            break
          case 'schedule':
            filter = findById(
              tableFilters[key].items,
              value === 'true' ? 1 : value === 'false' ? 0 : '',
            )
            if (filter) tableFilters[key].selected = filter.name
            break
          case 'user':
            filter = findById(tableFilters.user.items, value)
            if (filter) tableFilters.user.selected = filter.name
            break
          default:
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

      if ('uninstallDate' in tableFilters) {
        if (key === 'uninstall_date') {
          filter = findById(
            tableFilters.uninstallDate.items,
            value === 'true' ? 1 : value === 'false' ? 0 : '',
          )
          if (filter) tableFilters.uninstallDate.selected = filter.name
        }
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
      { id: '', label: $gettext('All') },
      {
        id: options.subscribed.join(','),
        label: $gettext('subscribed'),
        children: [
          {
            id: options.productive.join(','),
            label: $gettext('productive'),
            children: Object.entries(options.productive).map(([key, val]) => {
              return { id: val, label: options.choices[val] }
            }),
          },
          {
            id: options.unproductive.join(','),
            label: $gettext('unproductive'),
            children: Object.entries(options.unproductive).map(([key, val]) => {
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

  const onUuidFilter = () => {
    updateParams({
      columnFilters: Object.assign(serverParams.columnFilters, {
        uuid: tableFilters.uuid,
      }),
    })
    loadItems()
  }

  const queryParams = () => {
    let ret = {
      page_size: serverParams.perPage,
      page: serverParams.page,
    }

    if (serverParams.sort.field) {
      ret.ordering = `${serverParams.sort.type}${serverParams.sort.field}`
    }

    if (Object.keys(serverParams.columnFilters).length) {
      Object.entries(serverParams.columnFilters).map(([key, val]) => {
        switch (key) {
          case 'application_id':
            ret.application__id = val
            break
          case 'attribute_id':
            ret.attribute__id = val
            break
          case 'attributes_id':
            ret.attributes__id = val
            break
          case 'attributeset_included_id':
            ret.attributeset_included__id = val
            break
          case 'attributeset_excluded_id':
            ret.attributeset_excluded__id = val
            break
          case 'available_for_attributes_id':
            ret.available_for_attributes__id = val
            break
          case 'available_packages_id':
            ret.available_packages__id = val
            break
          case 'available_package_sets_id':
            ret.available_package_sets__id = val
            break
          case 'capability_id':
          case 'capability.name':
            ret.capability__id = val
            break
          case 'category':
          case 'category_id':
          case 'category.name':
            ret.category__id = val
            break
          case 'computer.__str__':
            ret.computer__name__icontains = val
            break
          case 'computer_id':
            ret.computer__id = val
            break
          case 'connections_id':
            ret.connections__id = val
            break
          case 'connection.name':
            ret.connection__id = val
            break
          case 'default_logical_device_id':
            ret.default_logical_device__id = val
            break
          case 'deployment':
            ret.deployment__isnull = val
            break
          case 'deployment_id':
            ret.deployment__id = val
            break
          case 'deployment_included_id':
            ret.deployment_included__id = val
            break
          case 'deployment_excluded_id':
            ret.deployment_excluded__id = val
            break
          case 'device_id':
            ret.device__id = val
            break
          case 'device_type_id':
          case 'device_type.name':
            ret.device_type__id = val
            break
          case 'domain_included_id':
            ret.domain_included__id = val
            break
          case 'domain_excluded_id':
            ret.domain_excluded__id = val
            break
          case 'domain_tags_id':
            ret.domain_tags__id = val
            break
          case 'domains_id':
            ret.domains__id = val
            break
          case 'drivers_project_id':
            ret.drivers__project__id = val
            break
          case 'excluded_attributes_id':
            ret.excluded_attributes__id = val
            break
          case 'faultdefinition_id':
            ret.faultdefinition__id = val
            break
          case 'faultdefinition_included_id':
            ret.faultdefinition_included__id = val
            break
          case 'faultdefinition_excluded_id':
            ret.faultdefinition_excluded__id = val
            break
          case 'faultdefinition_users_id':
            ret.faultdefinition_users__id = val
            break
          case 'fault_definition.name':
            ret.fault_definition_id = val
            break
          case 'id_in':
            ret.id__in = val
            break
          case 'included_attributes_id':
            ret.included_attributes__id = val
            break
          case 'level':
          case 'level.name':
            ret.level = val
            break
          case 'logical_id':
            ret.logical__id = val
            break
          case 'manufacturer.name':
            ret.manufacturer__id = val
            break
          case 'model':
            ret.device__model__id = val
            break
          case 'model.manufacturer.name':
            ret.model__manufacturer__id = val
            break
          case 'model_id':
          case 'model.name':
            ret.model__id = val
            break
          case 'package.project.name':
            ret.package__project__id = val
            break
          case 'package_id':
            ret.package__id = val
            break
          case 'packages':
            ret.packages__isnull = val
            break
          case 'packages_id':
            ret.packages__id = val
            break
          case 'packageset':
            ret.packageset__isnull = val
            break
          case 'packageset_id':
            ret.packageset__id = val
            break
          case 'packages_by_project_project_id':
            ret.packages_by_project__project__id = val
            break
          case 'platform':
            if (model.value === 'computers') ret[key] = val
            else if (model.value === 'projects') ret.platform__id = val
            else ret.project__platform__id = val
            break
          case 'platform.name':
            ret.platform__id = val
            break
          case 'policy_included_id':
            ret.policy_included__id = val
            break
          case 'policy_excluded_id':
            ret.policy_excluded__id = val
            break
          case 'project_id':
          case 'project.name':
            ret.project__id = val
            break
          case 'property_att':
            ret.property_att__id = val
            break
          case 'schedule':
            ret.schedule__isnull = val
            break
          case 'schedule_id':
          case 'schedule.name':
            ret.schedule__id = val
            break
          case 'singularity_id':
            ret.singularity__id = val
            break
          case 'singularity_included_id':
            ret.singularity_included__id = val
            break
          case 'singularity_excluded_id':
            ret.singularity_excluded__id = val
            break
          case 'scope_included_id':
            ret.scope_included__id = val
            break
          case 'scope_excluded_id':
            ret.scope_excluded__id = val
            break
          case 'status':
          case 'status_in':
          case 'status__in':
            if (model.value === 'computers' || model.value === 'status-logs')
              ret.status__in = val
            else ret.computer__status__in = val
            break
          case 'store':
            ret.store__isnull = val
            break
          case 'store.name':
            ret.store__id = val
            break
          case 'sync_attributes_id':
            ret.sync_attributes__id = val
            break
          case 'sync_attributes_id_in':
            ret.sync_attributes__id__in = val
            break
          case 'sync_user_id':
            ret.sync_user__id = val
            break
          case 'tags_id':
            ret.tags__id = val
            break
          case 'uninstall_date':
            ret.uninstall_date__isnull = val
            break
          case 'user_id':
            ret.user__id = val
            break
          case 'users_id':
            ret.users__id = val
            break
          case 'checked':
          case 'user':
          case 'platform_id':
          case 'pms_status_ok':
          case 'created_at__gte':
          case 'created_at__lt':
          case 'start_date__gte':
          case 'start_date__lt':
          case 'install_date__gte':
          case 'install_date__lt':
          case 'uninstall_date__gte':
          case 'uninstall_date__lt':
          case 'auto_register_computers':
          case 'enabled':
          case 'exclusive':
          case 'is_active':
          case 'sort':
          case 'kind':
          case 'language':
          case 'architecture':
          case 'machine':
          case 'product_system':
          case 'has_software_inventory':
          case 'installed_package':
          case 'serial':
          case 'sync_end_date__gte':
          case 'sync_end_date__lt':
          case 'percent__gte':
          case 'percent__lt':
          case 'total_computers':
          case 'score':
          case 'source':
          case 'search':
          case 'page':
          case 'page_size':
            ret[key] = val
            break
          case 'sync_end_date':
            if (val === 0) ret[`${key}__isnull`] = true
            else {
              let d = new Date()
              d = d.toISOString(d.setDate(d.getDate() - val))
              ret[`${key}__lt`] = d
            }
            break
          default:
            ret[`${key.replace('.', '__')}__icontains`] = val
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
      .then((response) => {
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
      .then((response) => {
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

    Object.entries(tableFilters).map(([key, value]) => {
      switch (key) {
        case 'createdAtRange':
        case 'installDateRange':
        case 'startDateRange':
        case 'syncEndDateRange':
        case 'uninstallDateRange':
          tableFilters[key].selected = { from: null, to: null }
          if (key === 'installDateRange' && installDateRange.value)
            installDateRange.value.reset(loadItemsAfter)
          if (key === 'uninstallDateRange' && uninstallDateRange.value)
            uninstallDateRange.value.reset(loadItemsAfter)
          if (key === 'createdAtRange' && createdAtRange.value)
            createdAtRange.value.reset(loadItemsAfter)
          if (key === 'startDateRange' && startDateRange.value)
            startDateRange.value.reset(loadItemsAfter)
          break
        case 'serial':
        case 'uuid':
        case 'search':
          tableFilters[key] = ''
          break
        case 'machine':
          if (machineTree.value) machineTree.value.reset()
          break
        case 'statusIn':
          if (statusTree.value) statusTree.value.reset()
          break
        default:
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
    regenerateMetadata,
    resetFilters,
  }
}
