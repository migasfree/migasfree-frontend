import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGettext } from 'vue3-gettext'

import { useAuthStore } from 'stores/auth'
import { RESULTS_PER_PAGE } from 'config/app.conf'

import { useFilters } from 'composables/dataGrid/filters'
import { useQueryParams } from 'composables/dataGrid/queryParams'
import { useDataOperations } from 'composables/dataGrid/dataOperations'
import { useTableHandlers } from 'composables/dataGrid/tableHandlers'

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
  const route = useRoute()
  const { $gettext } = useGettext()

  // Refs
  const myTable = ref(null)
  const machineTree = ref(null)
  const statusTree = ref(null)
  const createdAtRange = ref(null)
  const startDateRange = ref(null)
  const installDateRange = ref(null)
  const uninstallDateRange = ref(null)

  // State
  const perPage = RESULTS_PER_PAGE
  const rows = ref([])
  const totalRecords = ref(0)
  const isLoading = ref(false)
  const isLoadingExport = ref(false)
  const selectedRows = ref([])

  const paginationOptions = reactive({
    enabled: true,
    perPage,
    perPageDropdown: [10, 50, 100, 150],
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

  // Composables
  const {
    tableFilters,
    searchOptions,
    resetFilters: resetTableFilters,
  } = useFilters()

  const {
    queryParams,
    loadQueryParams,
    updateParams,
    resetColumnFilters,
    findById,
  } = useQueryParams({
    columns,
    model,
    tableFilters,
    serverParams,
    paginationOptions,
    machineTree,
    statusTree,
  })

  const {
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
  } = useDataOperations({
    model,
    detailRoute,
    isLoading,
    isLoadingExport,
    rows,
    totalRecords,
    selectedRows,
    queryParams,
  })

  const {
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
  } = useTableHandlers({
    tableFilters,
    serverParams,
    selectedRows,
    model,
    updateParams,
    loadItems,
    findById,
  })

  const resetFilters = (loadItemsAfter = true) => {
    myTable.value.reset()
    resetColumnFilters()

    const rangeRefs = {
      createdAtRange,
      startDateRange,
      installDateRange,
      uninstallDateRange,
    }

    resetTableFilters(rangeRefs, machineTree, statusTree, loadItemsAfter)

    if (loadItemsAfter) loadItems()
  }

  // Watchers
  watch(route, () => {
    resetFilters(false)
    loadQueryParams()
    loadItems()
  })

  // Lifecycle
  onMounted(async () => {
    await loadItems()
  })

  // Initialization
  loadQueryParams()
  if (Object.keys(columnParams.value).length > 0) {
    updateParams(columnParams.value)
  }
  if (model === 'scopes' && !authStore.user.is_superuser) {
    updateParams({
      columnFilters: { user: authStore.user.pk },
    })
  }

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
    resetFilters,
  }
}
