<template>
  <Header
    :title="title"
    :icon="titleIcon"
    :results="totalRecords"
    :add-route="addRoute"
    :is-loading-export="isLoadingExport"
    @export-all="exportAll"
  >
    <template #actions>
      <slot name="header-actions" />
    </template>
  </Header>

  <slot name="top" />

  <q-list v-if="moreFilters.length > 0" class="more-filters" bordered>
    <q-expansion-item
      :icon="appIcon('filter')"
      :label="$gettext('More Filters')"
    >
      <SearchFilter
        v-model="tableFilters.search"
        class="q-pa-md"
        @search="onSearch"
        @clear="onSearchClear"
      />

      <div class="row q-pa-md q-col-gutter-lg">
        <div
          v-if="moreFilters.includes('platform')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.platform.selected"
            :options="tableFilters.platform.items"
            :label="$gettext('By Platform')"
            @update:model-value="onPlatformFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('project')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.project.selected"
            :options="tableFilters.project.items"
            :label="$gettext('By Project')"
            @update:model-value="onProjectFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('architecture')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.architecture.selected"
            :options="tableFilters.architecture.items"
            :label="$gettext('By Architecture')"
            @update:model-value="onArchitectureFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('serial')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.serial"
            clearable
            :label="$gettext('By Serial Number')"
            @blur="onSerialFilter"
            @keydown.enter="$event.target.blur()"
            @clear="onSerialFilter"
          >
            <template #prepend>
              <div class="filter-icon-box">
                <q-icon :name="appIcon('filter')" size="18px" />
              </div>
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('mac')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.mac"
            clearable
            :label="$gettext('By MAC Address')"
            @blur="onMacFilter"
            @keydown.enter="$event.target.blur()"
            @clear="onMacFilter"
          >
            <template #prepend>
              <div class="filter-icon-box">
                <q-icon :name="appIcon('filter')" size="18px" />
              </div>
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('uuid')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.uuid"
            clearable
            :label="$gettext('By UUID')"
            @blur="onUuidFilter"
            @keydown.enter="$event.target.blur()"
            @clear="onUuidFilter"
          >
            <template #prepend>
              <div class="filter-icon-box">
                <q-icon :name="appIcon('filter')" size="18px" />
              </div>
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('softwareInventory')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.softwareInventory.selected"
            :options="tableFilters.softwareInventory.items"
            :label="$gettext('By Software Inventory')"
            @update:model-value="onSoftwareInventoryFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('statusIn')"
          class="col-12 col-md-4 col-sm-6"
        >
          <SelectTree
            ref="statusTree"
            v-model="tableFilters.statusIn.selected"
            :placeholder="$gettext('By Status')"
            :prepend-icon="appIcon('filter')"
            :options="tableFilters.statusIn.items"
            @select="onStatusInFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('machine')"
          class="col-12 col-sm-6 col-md-4"
        >
          <SelectTree
            ref="machineTree"
            v-model="tableFilters.machine.selected"
            :placeholder="$gettext('By Machine')"
            :prepend-icon="appIcon('filter')"
            :options="tableFilters.machine.items"
            @select="onMachineFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('user')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.user.selected"
            :options="tableFilters.user.items"
            :label="$gettext('By Assignment')"
            @update:model-value="onUserFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('startDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="startDateRange"
            v-model="tableFilters.startDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Start Date (range)')"
            @select="onStartDateRangeFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('createdAtRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="createdAtRange"
            v-model="tableFilters.createdAtRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="
              model === 'syncs'
                ? $gettext('By End Date (range)')
                : $gettext('By Subscribed Date (range)')
            "
            @select="onCreatedAtRangeFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('schedule')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.schedule.selected"
            :options="tableFilters.schedule.items"
            :label="$gettext('By Schedule')"
            @update:model-value="onScheduleFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('model')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.model.selected"
            :options="tableFilters.model.items"
            :label="$gettext('By Model')"
            @update:model-value="onModelFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('installDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="installDateRange"
            v-model="tableFilters.installDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Install Date (range)')"
            @select="onInstallDateRangeFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('uninstallDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="uninstallDateRange"
            v-model="tableFilters.uninstallDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Uninstall Date (range)')"
            @select="onUninstallDateRangeFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('uninstallDate')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.uninstallDate.selected"
            :options="tableFilters.uninstallDate.items"
            :label="$gettext('By Uninstall Date')"
            @update:model-value="onUninstallDateFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('syncEndDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="syncEndDateRange"
            v-model="tableFilters.syncEndDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Last Sync Date (range)')"
            @select="onSyncEndDateRangeFilter"
          />
        </div>

        <div
          v-if="moreFilters.includes('syncEndDate')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.syncEndDate.selected"
            :options="tableFilters.syncEndDate.items"
            :label="$gettext('By last sync date')"
            @update:model-value="onSyncEndDateFilter"
          />
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-12">
          <q-btn
            :icon="appIcon('filter-remove')"
            outline
            color="primary"
            :label="$gettext('Reset all filters')"
            @click="resetFilters"
          />
        </div>
      </div>
    </q-expansion-item>
  </q-list>
  <template v-else>
    <SearchFilter
      v-model="tableFilters.search"
      class="q-pb-md"
      @search="onSearch"
      @clear="onSearchClear"
    />

    <div class="row q-py-md">
      <div class="col-12">
        <q-btn
          :icon="appIcon('filter-remove')"
          outline
          color="primary"
          :label="$gettext('Reset all filters')"
          @click="resetFilters"
        />
      </div>
    </div>
  </template>

  <vue-good-table
    ref="myTable"
    :columns="filteredColumns"
    :rows="rows"
    mode="remote"
    compact-mode
    :total-rows="totalRecords"
    :is-loading="isLoading"
    :line-numbers="false"
    :select-options="{
      ...selectOptions,
      selectionInfoClass: 'table-selection-info',
    }"
    :pagination-options="paginationOptions"
    :search-options="searchOptions"
    style-class="vgt-table striped condensed"
    @page-change="onPageChange"
    @sort-change="onSortChange"
    @column-filter="onColumnFilter"
    @per-page-change="onPerPageChange"
    @selected-rows-change="onSelectionChanged"
  >
    <template #loadingContent>
      <span class="vgt-loading__content">
        <q-spinner size="sm" class="q-mr-sm q-mt-sm q-mb-sm" />
        {{ $gettext('Loading data...') }}
      </span>
    </template>

    <template #table-row="slotProps">
      <span v-if="slotProps.column.field == 'actions'">
        <q-btn
          v-if="hasCheckActions && !slotProps.row.checked"
          class="q-ma-xs action-btn-row"
          round
          flat
          size="sm"
          :icon="appIcon('check')"
          color="positive"
          @click="updateChecked(slotProps.row.id, true)"
          ><q-tooltip>{{ $gettext('Check') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="hasCheckActions && slotProps.row.checked"
          class="q-ma-xs action-btn-row"
          round
          flat
          size="sm"
          :icon="appIcon('uncheck')"
          color="negative"
          @click="updateChecked(slotProps.row.id, false)"
          ><q-tooltip>{{ $gettext('Not Check') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="
            hasEnableActions &&
            !('enabled' in slotProps.row && slotProps.row.enabled) &&
            !('is_active' in slotProps.row && slotProps.row.is_active)
          "
          class="q-ma-xs action-btn-row"
          round
          flat
          size="sm"
          :icon="appIcon('yes')"
          color="positive"
          @click="updateEnabled(slotProps.row.id, true)"
          ><q-tooltip>{{ $gettext('Enable') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="
            (hasEnableActions &&
              'enabled' in slotProps.row &&
              slotProps.row.enabled) ||
            ('is_active' in slotProps.row && slotProps.row.is_active)
          "
          class="q-ma-xs action-btn-row"
          round
          flat
          size="sm"
          :icon="appIcon('no')"
          color="negative"
          @click="updateEnabled(slotProps.row.id, false)"
          ><q-tooltip>{{ $gettext('Disable') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="detailRoute"
          class="q-ma-xs action-btn-row"
          round
          flat
          size="sm"
          :icon="appIcon('edit')"
          color="primary"
          @click="edit(slotProps.row.id)"
          ><q-tooltip>{{ $gettext('Edit') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="hasDeleteAction"
          class="q-ma-xs action-btn-row"
          round
          flat
          size="sm"
          :icon="appIcon('delete')"
          color="negative"
          @click="confirmRemove(slotProps.row.id)"
          ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
        >

        <slot name="actions" :props="slotProps"></slot>
      </span>

      <slot
        v-else
        :name="`cell-${slotProps.column.field}`.replace('.', '_')"
        :props="slotProps"
      >
        <span v-if="slotProps.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="slotProps.row.id"
            :value="slotProps.row.name"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="slotProps.row.computer.id"
            :value="slotProps.row.computer.__str__"
            :icon="elementIcon(slotProps.row.computer.status)"
            :tooltip="slotProps.row.computer.summary"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="slotProps.row.project?.id"
            :value="slotProps.row.project?.name || ''"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'domain.name'">
          <MigasLink
            v-if="slotProps.row.domain"
            model="domains"
            :pk="slotProps.row.domain.id"
            :value="slotProps.row.domain.name"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'property_att'">
          <MigasLink
            model="formulas"
            :pk="slotProps.row.property_att?.id"
            :value="slotProps.row.property_att?.name || ''"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'capability.name'">
          <MigasLink
            model="devices/capabilities"
            :pk="slotProps.row.capability?.id"
            :value="slotProps.row.capability?.name"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'device_type.name'">
          <MigasLink
            model="devices/types"
            :pk="slotProps.row.device_type?.id"
            :value="slotProps.row.device_type?.name"
          />
        </span>

        <span v-else-if="slotProps.column.field == 'store.name'">
          <MigasLink
            v-if="slotProps.row.store && slotProps.row.store.id > 0"
            model="stores"
            :pk="slotProps.row.store.id"
            :value="slotProps.row.store.name"
          />
        </span>

        <span
          v-else-if="
            ['created_at', 'updated_at'].includes(slotProps.column.field)
          "
        >
          <DateView :value="slotProps.row[slotProps.column.field]" />
        </span>

        <span
          v-else-if="slotProps.column.field == 'synchronization.start_date'"
        >
          <DateView :value="slotProps.row.synchronization.start_date" />
        </span>

        <span
          v-else-if="['checked', 'enabled'].includes(slotProps.column.field)"
        >
          <BooleanView :value="slotProps.row[slotProps.column.field]" />
        </span>

        <span
          v-else-if="['description', 'result'].includes(slotProps.column.field)"
        >
          <Truncate v-model="slotProps.row[slotProps.column.field]" />
        </span>

        <span v-else>
          {{ slotProps.formattedRow[slotProps.column.field] }}
        </span>
      </slot>
    </template>

    <template v-if="!isLoading" #emptystate>
      <div class="text-center q-pa-xl opacity-50">
        <q-icon name="mdi-database-off-outline" size="xl" class="q-mb-sm" />
        <div class="text-subtitle1">{{ $gettext('There are no results') }}</div>
      </div>
    </template>

    <template #selected-row-actions="slotProps">
      <slot name="selected-actions" :props="slotProps"></slot>

      <template v-if="hasCheckActions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          :icon="appIcon('check')"
          color="positive"
          @click="updateItemsChecked(true)"
          ><q-tooltip>{{ $gettext('Check') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          size="sm"
          :icon="appIcon('uncheck')"
          color="negative"
          @click="updateItemsChecked(false)"
          ><q-tooltip>{{ $gettext('Not Check') }}</q-tooltip></q-btn
        >
      </template>

      <template v-if="hasEnableActions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          :icon="appIcon('yes')"
          color="positive"
          @click="updateItemsEnabled(true)"
          ><q-tooltip>{{ $gettext('Enable') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          size="sm"
          :icon="appIcon('no')"
          color="negative"
          @click="updateItemsEnabled(false)"
          ><q-tooltip>{{ $gettext('Disable') }}</q-tooltip></q-btn
        >
      </template>

      <q-btn
        class="q-ma-xs"
        size="sm"
        color="primary"
        text-color="white"
        :icon="appIcon('export')"
        :loading="isLoadingExport"
        @click="exportData"
        ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="hasDeleteAction"
        size="sm"
        color="negative"
        :icon="appIcon('delete')"
        @click="confirmRemove"
        ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
      >
    </template>

    <template #pagination-bottom="paginationProps">
      <TablePagination
        :total="paginationProps.total"
        :page-changed="paginationProps.pageChanged"
        :per-page-changed="paginationProps.perPageChanged"
        :pagination-options="paginationOptions"
      />
    </template>
  </vue-good-table>
</template>

<script setup>
import { computed, toRef, onMounted, useSlots } from 'vue'
import { useRoute } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import FilterSelect from 'components/ui/FilterSelect'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import TablePagination from 'components/ui/TablePagination'
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'
import MigasLink from 'components/MigasLink'
import DateView from 'components/ui/DateView'
import BooleanView from 'components/ui/BooleanView'
import Truncate from 'components/ui/Truncate'

import useDataGrid from 'composables/dataGrid'
import { appIcon, modelIcon, useElement } from 'composables/element'

defineOptions({ name: 'TableResults' })

const props = defineProps({
  title: { type: String, required: true },
  columns: { type: Array, required: true },
  model: { type: String, required: true },
  routes: { type: Object, default: () => ({}) },
  columnParams: { type: Object, default: () => ({}) },
  moreFilters: { type: Array, default: () => [] },
})

defineEmits(['post-remove'])

const uiStore = useUiStore()
const route = useRoute()
const slots = useSlots()
const { elementIcon } = useElement()

const model = toRef(props, 'model')
const columnParams = toRef(props, 'columnParams')
const titleIcon = modelIcon(model.value)

const detailRoute = computed(() => props.routes.detail ?? null)
const addRoute = computed(() => props.routes.add ?? null)

const {
  tableFilters,
  resetFilters,
  isLoadingExport,
  exportAll,
  exportData,
  onSearch,
  onSearchClear,
  onCreatedAtRangeFilter,
  onStartDateRangeFilter,
  onScheduleFilter,
  onModelFilter,
  onStatusInFilter,
  onPlatformFilter,
  onProjectFilter,
  onUserFilter,
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
  statusTree,
  machineTree,
  installDateRange,
  uninstallDateRange,
  createdAtRange,
  startDateRange,
  syncEndDateRange,
  totalRecords,
  isLoading,
  selectOptions,
  paginationOptions,
  searchOptions,
  onPageChange,
  onSortChange,
  onColumnFilter,
  onPerPageChange,
  onSelectionChanged,
  rows,
  edit,
  myTable,
  confirmRemove,
  updateChecked,
  updateEnabled,
  updateStatusInFilter,
  updateItemsChecked,
  updateItemsEnabled,
  loadItems,
} = useDataGrid(props.columns, model, detailRoute, columnParams)

// --- Model-based feature flags ---

const DELETABLE_MODELS = new Set([
  'syncs',
  'status-logs',
  'migrations',
  'messages',
  'notifications',
])

const CHECKABLE_MODELS = new Set(['errors', 'faults', 'notifications'])

const ENABLEABLE_MODELS = new Set([
  'formulas',
  'singularities',
  'stamps',
  'attribute-sets',
  'fault-definitions',
  'user-profiles',
  'deployments',
  'catalog/policies',
])

const hasDeleteAction = computed(
  () => !!detailRoute.value || DELETABLE_MODELS.has(props.model),
)
const hasCheckActions = computed(() => CHECKABLE_MODELS.has(props.model))
const hasEnableActions = computed(() => ENABLEABLE_MODELS.has(props.model))

const showActionsColumn = computed(() => {
  return (
    hasCheckActions.value ||
    hasEnableActions.value ||
    hasDeleteAction.value ||
    !!slots.actions
  )
})

const filteredColumns = computed(() => {
  if (showActionsColumn.value) return props.columns

  return props.columns.filter((c) => c.field !== 'actions')
})

// --- Filter loading ---

const ALLOWED_FILTER_KEYS = new Set([
  'platform',
  'project',
  'statusIn',
  'model',
  'user',
  'architecture',
  'machine',
  'syncEndDate',
  'softwareInventory',
])

const ALLOWED_QUERY_PARAMS = new Set([
  'platform_id',
  'model_id',
  'packages_by_project_project_id',
  'drivers_project_id',
  'user',
])

const loadFilter = async (endpoint, filterKey, queryParam) => {
  if (!ALLOWED_FILTER_KEYS.has(filterKey)) {
    throw new Error(`Invalid filter key: ${filterKey}`)
  }

  try {
    const { data } = await api.get(endpoint)
    tableFilters[filterKey].items.push(...data.results)

    if (
      queryParam &&
      ALLOWED_QUERY_PARAMS.has(queryParam) &&
      route.query[queryParam]
    ) {
      tableFilters[filterKey].selected = tableFilters[filterKey].items.find(
        (x) => x.id == route.query[queryParam],
      )
    }
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  if (!props.moreFilters.length) return

  if (props.moreFilters.includes('platform')) {
    await loadFilter('/api/v1/token/platforms/', 'platform', 'platform_id')
  }

  if (props.moreFilters.includes('project')) {
    try {
      const { data } = await api.get('/api/v1/token/projects/')
      tableFilters.project.items.push(...data.results)

      const projectQuery =
        route.query.packages_by_project_project_id ||
        route.query.drivers_project_id
      if (projectQuery) {
        tableFilters.project.selected = tableFilters.project.items.find(
          (x) => x.id == projectQuery,
        )
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  if (props.moreFilters.includes('statusIn')) {
    try {
      const { data } = await api.get('/api/v1/token/computers/status/')
      updateStatusInFilter(data)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  if (props.moreFilters.includes('model')) {
    await loadFilter('/api/v1/token/devices/models/', 'model', 'model_id')
  }

  if (props.moreFilters.includes('user')) {
    try {
      const { data } = await api.get('/api/v1/token/faults/user/')
      Object.entries(data.choices).forEach(([key, val]) => {
        tableFilters.user.items.push({ id: key, name: val })
      })
      if (route.query.user) {
        tableFilters.user.selected = tableFilters.user.items.find(
          (x) => x.id == route.query.user,
        )
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }
})

defineExpose({
  loadItems,
  onSearch,
  onSearchClear,
  resetFilters,
  exportAll,
  exportData,
  onSelectionChanged,
  updateChecked,
  isLoading,
})
</script>

<style scoped>
.action-btn-row {
  background: rgba(var(--brand-primary-rgb), 0.04) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.action-btn-row:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn-row.text-primary:hover {
  background: rgba(var(--brand-primary-rgb), 0.12) !important;
}

.action-btn-row.text-positive:hover {
  background: var(--success-surface) !important;
}

.action-btn-row.text-negative:hover {
  background: var(--error-surface) !important;
}

[data-theme='dark'] .action-btn-row {
  background: rgba(255, 255, 255, 0.05) !important;
}

[data-theme='dark'] .action-btn-row.text-primary:hover {
  background: rgba(var(--brand-primary-rgb), 0.2) !important;
}

.q-list--dark {
  border-color: #888;
}

/* --- Selection Checkbox Styling --- */
:deep(.vgt-checkbox-col) {
  width: 50px !important;
  text-align: center !important;
}

:deep(.vgt-checkbox-col input[type='checkbox']),
:deep(.vgt-table input[type='checkbox']) {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 20px !important;
  height: 20px !important;
  border: 2px solid var(--neutral-300, #cbd5e1) !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  position: relative !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: transparent !important;
  display: block !important;
  margin: 0 auto !important;
  accent-color: var(--brand-primary) !important;
}

:deep(.vgt-checkbox-col input[type='checkbox']:checked),
:deep(.vgt-table input[type='checkbox']:checked) {
  background-color: var(--brand-primary) !important;
  border-color: var(--brand-primary) !important;
}

:deep(.vgt-checkbox-col input[type='checkbox']:checked::after),
:deep(.vgt-table input[type='checkbox']:checked::after) {
  content: '' !important;
  position: absolute !important;
  top: 2px !important;
  left: 6px !important;
  width: 5px !important;
  height: 10px !important;
  border: solid white !important;
  border-width: 0 2px 2px 0 !important;
  transform: rotate(45deg) !important;
  animation: table-check-in 0.2s ease-out forwards !important;
}

:deep(.vgt-checkbox-col input[type='checkbox']:hover),
:deep(.vgt-table input[type='checkbox']:hover) {
  border-color: var(--brand-primary) !important;
  background-color: rgba(var(--brand-primary-rgb), 0.05) !important;
}

:deep(.vgt-checkbox-col input[type='checkbox']:focus),
:deep(.vgt-table input[type='checkbox']:focus) {
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(var(--brand-primary-rgb), 0.15) !important;
}

@keyframes table-check-in {
  from {
    opacity: 0;
    transform: rotate(45deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

:deep(.vgt-table tr.selected) {
  background-color: rgba(var(--brand-primary-rgb), 0.04) !important;
}

/* Selection Info Bar */
:deep(.table-selection-info) {
  background: var(--brand-primary) !important;
  color: white !important;
  padding: 8px 16px !important;
  border-radius: var(--radius, 10px) !important;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  margin-bottom: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  box-shadow: 0 4px 12px rgba(var(--brand-primary-rgb), 0.2) !important;
  user-select: none;
}

:deep(.table-selection-info a) {
  color: var(--brand-tertiary, #fbbf24) !important;
  background-color: transparent !important;
  text-decoration: none !important;
  font-weight: 900 !important;
  font-size: 0.75rem !important;
  margin-left: 12px !important;
}

:deep(.table-selection-info a:hover) {
  text-decoration: underline !important;
}

[data-theme='dark'] :deep(.table-selection-info) {
  background: var(--brand-tertiary, #fbbf24) !important;
  color: var(--neutral-900, #171717) !important;
}

[data-theme='dark'] :deep(.table-selection-info a) {
  color: var(--neutral-900, #171717) !important;
  opacity: 0.7;
}

[data-theme='dark'] :deep(.vgt-checkbox-col input[type='checkbox']),
[data-theme='dark'] :deep(.vgt-table input[type='checkbox']) {
  border-color: rgba(255, 255, 255, 0.2) !important;
  accent-color: var(--brand-tertiary, #fbbf24) !important;
}

[data-theme='dark'] :deep(.vgt-checkbox-col input[type='checkbox']:checked),
[data-theme='dark'] :deep(.vgt-table input[type='checkbox']:checked) {
  background-color: var(--brand-tertiary, #fbbf24) !important;
  border-color: var(--brand-tertiary, #fbbf24) !important;
}

[data-theme='dark']
  :deep(.vgt-checkbox-col input[type='checkbox']:checked::after),
[data-theme='dark'] :deep(.vgt-table input[type='checkbox']:checked::after) {
  border-color: var(--neutral-900, #171717) !important;
}

[data-theme='dark'] :deep(.vgt-table th.vgt-checkbox-col),
[data-theme='dark'] :deep(.vgt-table th.line-numbers) {
  background: transparent !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

[data-theme='dark'] :deep(.vgt-table thead th.vgt-checkbox-col) {
  background: rgba(254, 252, 232, 0.05) !important;
}
</style>
