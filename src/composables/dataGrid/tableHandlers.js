import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'

import { useUiStore } from 'stores/ui'

export function useTableHandlers(deps) {
  const {
    tableFilters,
    serverParams,
    selectedRows,
    model,
    updateParams,
    loadItems,
    findById,
  } = deps

  const route = useRoute()
  const { $gettext } = useGettext()
  const uiStore = useUiStore()

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
      { id: '', name: $gettext('All') },
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

  return {
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
  }
}
