<template>
  <Header
    :title="title"
    :icon="titleIcon"
    :results="totalRecords"
    :add-route="addRoute"
    :is-loading-export="isLoadingExport"
    @export-all="exportAll"
  />

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
          <q-select
            v-model="tableFilters.platform.selected"
            :options="tableFilters.platform.items"
            :label="$gettext('By Platform')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onPlatformFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
        </div>

        <div
          v-if="moreFilters.includes('project')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-select
            v-model="tableFilters.project.selected"
            :options="tableFilters.project.items"
            :label="$gettext('By Project')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onProjectFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
        </div>

        <div
          v-if="moreFilters.includes('architecture')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-select
            v-model="tableFilters.architecture.selected"
            :options="tableFilters.architecture.items"
            :label="$gettext('By Architecture')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onArchitectureFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
        </div>

        <div
          v-if="moreFilters.includes('serial')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.serial"
            outlined
            dense
            clearable
            :label="$gettext('By Serial Number')"
            @blur="onSerialFilter"
            @keydown.enter="$event.target.blur()"
            @clear="onSerialFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('mac')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.mac"
            outlined
            dense
            clearable
            :label="$gettext('By MAC Address')"
            @blur="onMacFilter"
            @keydown.enter="$event.target.blur()"
            @clear="onMacFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('uuid')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.uuid"
            outlined
            dense
            clearable
            :label="$gettext('By UUID')"
            @blur="onUuidFilter"
            @keydown.enter="$event.target.blur()"
            @clear="onUuidFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('softwareInventory')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-select
            v-model="tableFilters.softwareInventory.selected"
            :options="tableFilters.softwareInventory.items"
            :label="$gettext('By Software Inventory')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onSoftwareInventoryFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
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
          <q-select
            v-model="tableFilters.user.selected"
            :options="tableFilters.user.items"
            :label="$gettext('By Assignment')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onUserFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
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
          <q-select
            v-model="tableFilters.schedule.selected"
            :options="tableFilters.schedule.items"
            :label="$gettext('By Schedule')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onScheduleFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
        </div>

        <div
          v-if="moreFilters.includes('model')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-select
            v-model="tableFilters.model.selected"
            :options="tableFilters.model.items"
            :label="$gettext('By Model')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onModelFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
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
          <q-select
            v-model="tableFilters.uninstallDate.selected"
            :options="tableFilters.uninstallDate.items"
            :label="$gettext('By Uninstall Date')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onUninstallDateFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
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
          <q-select
            v-model="tableFilters.syncEndDate.selected"
            :options="tableFilters.syncEndDate.items"
            :label="$gettext('By last sync date')"
            dense
            outlined
            option-value="id"
            option-label="name"
            @update:model-value="onSyncEndDateFilter"
          >
            <template #before>
              <q-icon :name="appIcon('filter')" />
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-12">
          <q-btn
            :icon="appIcon('filter-remove')"
            color="info"
            text-color="black"
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
          color="info"
          text-color="black"
          :label="$gettext('Reset all filters')"
          @click="resetFilters"
        />
      </div>
    </div>
  </template>

  <vue-good-table
    ref="myTable"
    :columns="columns"
    :rows="rows"
    mode="remote"
    compact-mode
    :total-rows="totalRecords"
    :is-loading="isLoading"
    :line-numbers="false"
    :select-options="selectOptions"
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

    <template #table-row="props">
      <span v-if="props.column.field == 'actions'">
        <q-btn
          v-if="hasCheckActions && !props.row.checked"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('check')"
          color="positive"
          @click="updateChecked(props.row.id, true)"
          ><q-tooltip>{{ $gettext('Check') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="hasCheckActions && props.row.checked"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('uncheck')"
          color="negative"
          @click="updateChecked(props.row.id, false)"
          ><q-tooltip>{{ $gettext('Not Check') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="
            hasEnableActions &&
            !('enabled' in props.row && props.row.enabled) &&
            !('is_active' in props.row && props.row.is_active)
          "
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('yes')"
          color="positive"
          @click="updateEnabled(props.row.id, true)"
          ><q-tooltip>{{ $gettext('Enable') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="
            (hasEnableActions && 'enabled' in props.row && props.row.enabled) ||
            ('is_active' in props.row && props.row.is_active)
          "
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('no')"
          color="negative"
          @click="updateEnabled(props.row.id, false)"
          ><q-tooltip>{{ $gettext('Disable') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="detailRoute"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('edit')"
          color="primary"
          @click="edit(props.row.id)"
          ><q-tooltip>{{ $gettext('Edit') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="hasDeleteAction"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('delete')"
          color="negative"
          @click="confirmRemove(props.row.id)"
          ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="model === 'user-profiles'"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('password')"
          color="info"
          @click="
            $router.push({
              name: 'user-profile-change-password',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Change Password') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="model === 'deployments' && props.row.source === 'I'"
          class="q-ma-xs"
          round
          size="sm"
          icon="mdi-autorenew"
          color="primary"
          @click="regenerateMetadata(props.row.id)"
          ><q-tooltip>{{ $gettext('Regenerate Metadata') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="model === 'packages' && props.row.store.id"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('information')"
          color="info"
          @click="
            $router.push({
              name: 'package-information',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Package Information') }}</q-tooltip></q-btn
        >
        <q-btn
          v-if="model === 'packages' && props.row.url"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('download')"
          color="info"
          type="a"
          :href="`${server}${props.row.url}`"
          ><q-tooltip>{{ $gettext('Download') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="model === 'computers'"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('events')"
          color="info"
          @click="
            $router.push({
              name: 'computer-events',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Events') }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="model === 'computers'"
          class="q-ma-xs"
          round
          size="sm"
          :icon="appIcon('simulate')"
          color="info"
          @click="
            $router.push({
              name: 'computer-simulate',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{
            $gettext('Simulate synchronization')
          }}</q-tooltip></q-btn
        >

        <q-btn
          v-if="model === 'computers'"
          class="q-ma-xs"
          round
          size="sm"
          icon="mdi-card-account-details-outline"
          color="info"
          @click="
            $router.push({
              name: 'computer-label',
              params: { id: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Identification') }}</q-tooltip></q-btn
        >
      </span>

      <slot name="fields" :props="props"></slot>
    </template>

    <template v-if="!isLoading" #emptystate>
      <BannerInfo :message="$gettext('There are no results')" />
    </template>

    <template #selected-row-actions="props">
      <slot name="selected-actions" :props="props"></slot>

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

    <template #pagination-bottom="props">
      <TablePagination
        :total="props.total"
        :page-changed="props.pageChanged"
        :per-page-changed="props.perPageChanged"
        :pagination-options="paginationOptions"
      />
    </template>
  </vue-good-table>
</template>

<script>
import { defineComponent, computed, toRefs, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import BannerInfo from 'components/ui/BannerInfo'
import Header from 'components/ui/Header'
import SearchFilter from 'components/ui/SearchFilter'
import TablePagination from 'components/ui/TablePagination'
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'

import useDataGrid from 'composables/dataGrid'
import { appIcon, modelIcon } from 'composables/element'

export default defineComponent({
  name: 'TableResults',
  components: {
    BannerInfo,
    Header,
    SearchFilter,
    TablePagination,
    SelectTree,
    DateRangeInput,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    routes: {
      type: Object,
      required: false,
      default() {
        return {}
      },
    },
    columnParams: {
      type: Object,
      required: false,
      default: () => {
        return {}
      },
    },
    moreFilters: {
      type: Array,
      required: false,
      default: () => {
        return []
      },
    },
  },
  emits: ['post-remove'],
  setup(props) {
    const uiStore = useUiStore()
    const route = useRoute()

    const { model, routes, columnParams } = toRefs(props)
    const titleIcon = modelIcon(model.value)

    const detailRoute = computed(() => {
      if ('detail' in routes.value) return routes.value.detail
      return null
    })

    const addRoute = computed(() => {
      if ('add' in routes.value) return routes.value.add
      return null
    })

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
      installDateRange,
      uninstallDateRange,
      createdAtRange,
      startDateRange,
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
      loadItems,
      rows,
      edit,
      remove,
      myTable,
      confirmRemove,
      updateChecked,
      updateEnabled,
      regenerateMetadata,
      updateStatusInFilter,
      updateItemsChecked,
      updateItemsEnabled,
    } = useDataGrid(props.columns, model, detailRoute, columnParams)

    const hasDeleteAction = computed(() => {
      return (
        detailRoute.value ||
        [
          'syncs',
          'status-logs',
          'migrations',
          'messages',
          'notifications',
        ].includes(props.model)
      )
    })

    const hasCheckActions = computed(() => {
      return ['errors', 'faults', 'notifications'].includes(props.model)
    })

    const hasEnableActions = computed(() => {
      return [
        'formulas',
        'singularities',
        'stamps',
        'attribute-sets',
        'fault-definitions',
        'user-profiles',
        'deployments',
        'catalog/policies',
      ].includes(props.model)
    })

    onMounted(async () => {
      if (props.moreFilters.length === 0) return

      if (props.moreFilters.includes('platform')) {
        await api
          .get('/api/v1/token/platforms/')
          .then((response) => {
            tableFilters.platform.items = tableFilters.platform.items.concat(
              response.data.results,
            )

            if (route.query.platform_id) {
              tableFilters.platform.selected = tableFilters.platform.items.find(
                (x) => x.id == route.query.platform_id,
              )
            }
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }

      if (props.moreFilters.includes('project')) {
        await api
          .get('/api/v1/token/projects/')
          .then((response) => {
            tableFilters.project.items = tableFilters.project.items.concat(
              response.data.results,
            )

            if (route.query.packages_by_project_project_id) {
              tableFilters.project.selected = tableFilters.project.items.find(
                (x) => x.id == route.query.packages_by_project_project_id,
              )
            }

            if (route.query.drivers_project_id) {
              tableFilters.project.selected = tableFilters.project.items.find(
                (x) => x.id == route.query.drivers_project_id,
              )
            }
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }

      if (props.moreFilters.includes('statusIn')) {
        await api
          .get('/api/v1/token/computers/status/')
          .then((response) => {
            updateStatusInFilter(response.data)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }

      if (props.moreFilters.includes('model')) {
        await api
          .get('/api/v1/token/devices/models/')
          .then((response) => {
            tableFilters.model.items = tableFilters.model.items.concat(
              response.data.results,
            )

            if (route.query.model_id) {
              tableFilters.model.selected = tableFilters.model.items.find(
                (x) => x.id == route.query.model_id,
              )
            }
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }

      if (props.moreFilters.includes('user')) {
        await api
          .get('/api/v1/token/faults/user/')
          .then((response) => {
            Object.entries(response.data.choices).map(([key, val]) => {
              tableFilters.user.items.push({ id: key, name: val })
            })

            if (route.query.user) {
              tableFilters.user.selected = tableFilters.user.items.find(
                (x) => x.id == route.query.user,
              )
            }
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }
    })

    return {
      server: uiStore.server,
      titleIcon,
      statusTree,
      installDateRange,
      uninstallDateRange,
      createdAtRange,
      startDateRange,
      tableFilters,
      resetFilters,
      isLoadingExport,
      exportAll,
      exportData,
      hasDeleteAction,
      hasCheckActions,
      hasEnableActions,
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
      loadItems,
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
      remove,
      myTable,
      confirmRemove,
      updateChecked,
      updateItemsChecked,
      updateEnabled,
      updateItemsEnabled,
      regenerateMetadata,
      appIcon,
      detailRoute,
      addRoute,
    }
  },
})
</script>

<style scoped>
.q-list--dark {
  border-color: #888;
}
</style>
