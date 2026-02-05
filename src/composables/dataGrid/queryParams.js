import _merge from 'lodash/merge.js'
import { useRoute } from 'vue-router'

import { useUiStore } from 'stores/ui'
import { fieldMappings } from 'composables/dataGrid/fieldMappings'

export function useQueryParams(deps) {
  const { columns, model, tableFilters, serverParams, paginationOptions } = deps

  const route = useRoute()
  const uiStore = useUiStore()

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

      // eslint-disable-next-line security/detect-object-injection
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
          // eslint-disable-next-line security/detect-object-injection
          if (typeof tableFilters[key] === 'object')
            // eslint-disable-next-line security/detect-object-injection
            tableFilters[key].selected = value
          // eslint-disable-next-line security/detect-object-injection
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

  const queryParams = () => {
    const ret = {
      page_size: serverParams.perPage,
      page: serverParams.page,
    }

    if (serverParams.sort.field) {
      ret.ordering = `${serverParams.sort.type}${serverParams.sort.field}`
    }

    const fieldMap = fieldMappings(model)

    //  Apply filters
    if (Object.keys(serverParams.columnFilters).length) {
      Object.entries(serverParams.columnFilters).forEach(([key, val]) => {
        // eslint-disable-next-line security/detect-object-injection
        const mapper = fieldMap[key] ?? fieldMap.__default
        if (typeof mapper === 'function') {
          Object.assign(ret, mapper(key, val))
        } else {
          // eslint-disable-next-line security/detect-object-injection
          ret[mapper] = val
        }
      })
    }

    return ret
  }

  return {
    queryParams,
    loadQueryParams,
    updateParams,
    resetColumnFilters,
    findById,
  }
}
