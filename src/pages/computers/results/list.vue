<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :results="totalRecords" />

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" :label="$gettext('More Filters')">
        <SearchFilter
          v-model="tableFilters.search"
          @search="onSearch"
          @clear="onSearchClear"
        />

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.platform.selected"
              :options="tableFilters.platform.items"
              :label="$gettext('By Platform')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onPlatformFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.architecture.selected"
              :options="tableFilters.architecture.items"
              :label="$gettext('By Architecture')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onArchitectureFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.syncEndDate.selected"
              :options="tableFilters.syncEndDate.items"
              :label="$gettext('By last sync date')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onSyncEndDateFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="tableFilters.softwareInventory.selected"
              :options="tableFilters.softwareInventory.items"
              :label="$gettext('By Software Inventory')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onSoftwareInventoryFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6">
            <SelectTree
              ref="statusTree"
              v-model="tableFilters.statusIn.selected"
              :placeholder="$gettext('By Status')"
              prepend-icon="mdi-filter"
              :options="tableFilters.statusIn.items"
              @select="onStatusInFilter"
            />
          </div>
        </div>

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-12 col-sm-6 col-md-4">
            <DateRangeInput
              ref="createdAtRange"
              v-model="tableFilters.createdAtRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Subscribed Date (range)')"
              @select="onCreatedAtRangeFilter"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <DateRangeInput
              ref="syncEndDateRange"
              v-model="tableFilters.syncEndDateRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Last Sync Date (range)')"
              @select="onSyncEndDateRangeFilter"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <SelectTree
              ref="machineTree"
              v-model="tableFilters.machine.selected"
              :placeholder="$gettext('By Machine')"
              prepend-icon="mdi-filter"
              :options="tableFilters.machine.items"
              @select="onMachineFilter"
            />
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-btn
              icon="mdi-filter-remove"
              color="info"
              text-color="black"
              :label="$gettext('Reset all filters')"
              @click="resetFilters"
            />
          </div>
        </div>
      </q-expansion-item>
    </q-list>

    <vue-good-table
      ref="myTable"
      :columns="columns"
      :rows="rows"
      mode="remote"
      compact-mode
      :total-rows="totalRecords"
      :is-loading.sync="isLoading"
      :line-numbers="false"
      :select-options="selectOptions"
      :pagination-options="paginationOptions"
      :search-options="searchOptions"
      style-class="vgt-table striped condensed"
      @on-page-change="onPageChange"
      @on-sort-change="onSortChange"
      @on-column-filter="onColumnFilter"
      @on-per-page-change="onPerPageChange"
      @on-selected-rows-change="onSelectionChanged"
    >
      <span slot="loadingContent" v-translate class="vgt-loading__content"
        >Loading data...
      </span>

      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'actions'">
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-pencil"
            color="primary"
            @click="edit(props.row.id)"
            ><q-tooltip>{{ $gettext('Edit') }}</q-tooltip></q-btn
          >
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
            ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
          >
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            :icon="productIcon(props.row.product_system)"
            color="info"
            @click="
              $router.push({
                name: 'computer-hardware',
                params: { id: props.row.id }
              })
            "
            ><q-tooltip>{{
              $gettext('Hardware Information')
            }}</q-tooltip></q-btn
          >
        </span>

        <span v-else-if="props.column.field == 'name'">
          <MigasLink
            model="computers"
            :pk="props.row.id"
            :icon="elementIcon(props.row.status)"
            :value="props.row.__str__ || ''"
            :tooltip="props.row.summary"
          />
        </span>

        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
            icon="mdi-sitemap"
          />
        </span>

        <span v-else-if="props.column.field == 'sync_user.name'">
          <MigasLink
            model="users"
            :pk="props.row.sync_user.id"
            :value="props.row.sync_user.__str__ || ''"
            icon="mdi-account"
          />
        </span>

        <span v-else-if="props.column.field == 'product'">
          <MigasLink
            model="computers"
            :pk="props.row.id"
            :value="props.row.product || ''"
            :icon="productIcon(props.row.product_system)"
            :tooltip="props.row.product_system"
          />
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>

      <q-banner slot="emptystate" rounded class="bg-warning text-black">
        <translate>There are no results</translate>
      </q-banner>

      <div slot="selected-row-actions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          color="info"
          icon="mdi-file-export"
          @click="exportData"
          ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
        >
        <q-btn
          class="q-ma-xs"
          size="sm"
          color="negative"
          icon="mdi-delete"
          @click="confirmRemove"
          ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
        >
      </div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Computers List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    SelectTree,
    DateRangeInput,
    Header,
    MigasLink
  },
  mixins: [elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Computers'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Computers'),
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic'
        },
        {
          text: this.$gettext('Results')
        }
      ],
      columns: [
        {
          field: 'id',
          hidden: true
        },
        {
          label: this.$gettext('Actions'),
          field: 'actions',
          html: true,
          sortable: false,
          globalSearchDisabled: true
        },
        {
          label: this.$gettext('Name'),
          field: 'name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: '__str__',
          hidden: true
        },
        {
          field: 'project.id',
          hidden: true
        },
        {
          label: this.$gettext('Project'),
          field: 'project.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        },
        {
          field: 'sync_user.id',
          hidden: true
        },
        {
          label: this.$gettext('User'),
          field: 'sync_user.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Sync end Date'),
          field: 'sync_end_date',
          type: 'date',
          dateInputFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSSSS",
          dateOutputFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        {
          field: 'product_system',
          hidden: true
        },
        {
          label: this.$gettext('Product'),
          field: 'product',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'summary',
          hidden: true
        }
      ],
      tableFilters: {
        search: '',
        platform: {
          items: [{ id: '', name: this.$gettext('All') }],
          selected: null
        },
        architecture: {
          items: [
            { id: '', name: this.$gettext('All') },
            {
              id: 32,
              name: this.$gettextInterpolate(this.$gettext('%{n} bits'), {
                n: 32
              })
            },
            {
              id: 64,
              name: this.$gettextInterpolate(this.$gettext('%{n} bits'), {
                n: 64
              })
            }
          ],
          selected: null
        },
        machine: {
          items: [
            { id: '', label: this.$gettext('All') },
            {
              id: 'P',
              label: this.$gettext('Physical'),
              children: [
                { id: 'desktop', label: this.$gettext('desktop') },
                { id: 'laptop', label: this.$gettext('laptop') }
              ]
            },
            {
              id: 'V',
              label: this.$gettext('Virtual'),
              children: [
                { id: 'virtual', label: this.$gettext('emulator') },
                { id: 'docker', label: this.$gettext('container') }
              ]
            }
          ],
          selected: null
        },
        syncEndDate: {
          items: [
            { id: '', name: this.$gettext('All') },
            { id: 0, name: this.$gettext('without date') },
            {
              id: 7,
              name: this.$gettextInterpolate(this.$gettext('%{n} days ago'), {
                n: 7
              })
            },
            {
              id: 30,
              name: this.$gettextInterpolate(this.$gettext('%{n} days ago'), {
                n: 30
              })
            },
            {
              id: 60,
              name: this.$gettextInterpolate(this.$gettext('%{n} days ago'), {
                n: 60
              })
            },
            {
              id: 180,
              name: this.$gettextInterpolate(this.$gettext('%{n} days ago'), {
                n: 180
              })
            },
            {
              id: 365,
              name: this.$gettextInterpolate(this.$gettext('%{n} days ago'), {
                n: 365
              })
            }
          ],
          selected: null
        },
        softwareInventory: {
          items: [
            { id: '', name: this.$gettext('All') },
            { id: 0, name: this.$gettext('without inventory') }
          ],
          selected: null
        },
        statusIn: {
          items: [],
          selected: null,
          choices: {}
        },
        createdAtRange: {
          selected: { from: null, to: null }
        },
        syncEndDateRange: {
          selected: { from: null, to: null }
        }
      },
      model: 'computers',
      detailRoute: 'computer-detail'
    }
  },
  methods: {
    onArchitectureFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          architecture: params.id
        })
      })
      this.loadItems()
    },

    onMachineFilter(params) {
      if (params.id === '' || params.id === 'P' || params.id === 'V') {
        this.updateParams({
          columnFilters: Object.assign(this.serverParams.columnFilters, {
            machine: params.id,
            product_system: ''
          })
        })
      } else {
        this.updateParams({
          columnFilters: Object.assign(this.serverParams.columnFilters, {
            machine: '',
            product_system: params.id
          })
        })
      }
      this.loadItems()
    },

    onSyncEndDateFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          sync_end_date: params.id
        })
      })
      this.loadItems()
    },

    onSoftwareInventoryFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          has_software_inventory: params.id === 0 ? false : ''
        })
      })
      this.loadItems()
    },

    onSyncEndDateRangeFilter(params) {
      this.tableFilters.syncEndDateRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          sync_end_date__gte:
            this.tableFilters.syncEndDateRange.selected.from + 'T00:00:00',
          sync_end_date__lt:
            this.tableFilters.syncEndDateRange.selected.to + 'T23:59:59'
        })
      })
      this.loadItems()
    },

    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/platforms/')
        .then((response) => {
          this.tableFilters.platform.items = this.tableFilters.platform.items.concat(
            response.data.results
          )

          if (this.$route.query.platform_id) {
            this.tableFilters.platform.selected = this.tableFilters.platform.items.find(
              (x) => x.id == this.$route.query.platform_id
            )
          }
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/projects/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'project.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name
              }
            }
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/computers/status/')
        .then((response) => {
          this.updateStatusInFilter(response.data)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
