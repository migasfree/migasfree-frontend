<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :results="totalRecords">
      <template #append>
        <q-btn
          class="q-ma-sm float-right"
          color="info"
          text-color="black"
          :label="$gettext('Export')"
          icon="mdi-file-export"
          :loading="isLoadingExport"
          :disable="totalRecords === 0"
          @click="exportAll"
        />
      </template>
    </Header>

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" :label="$gettext('More Filters')">
        <SearchFilter
          v-model="tableFilters.search"
          @search="onSearch"
          @clear="onSearchClear"
        />

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-4 col-md">
            <DateRangeInput
              ref="installDateRange"
              v-model="tableFilters.installDateRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Install Date (range)')"
              @select="onInstallDateRangeFilter"
            />
          </div>

          <div class="col-4 col-md">
            <DateRangeInput
              ref="uninstallDateRange"
              v-model="tableFilters.uninstallDateRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Uninstall Date (range)')"
              @select="onUninstallDateRangeFilter"
            />
          </div>

          <div class="col-4 col-md">
            <q-select
              v-model="tableFilters.uninstallDate.selected"
              :options="tableFilters.uninstallDate.items"
              :label="$gettext('By Uninstall Date')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onUninstallDateFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
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
      <span slot="loadingContent" class="vgt-loading__content">
        <q-spinner size="sm" />
        <translate>Loading data...</translate>
      </span>

      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="props.row.computer.id"
            :value="props.row.computer.__str__"
            :icon="elementIcon(props.row.computer.status)"
            :tooltip="props.row.computer.summary"
          />
        </span>

        <span v-else-if="props.column.field == 'package.fullname'">
          <MigasLink
            model="packages"
            :pk="props.row.package.id"
            :value="props.row.package.fullname"
            icon="mdi-package-variant"
          />
        </span>

        <span v-else-if="props.column.field == 'package.project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.package.project.id"
            :value="props.row.package.project.name"
            icon="mdi-sitemap"
          />
        </span>

        <span v-else-if="props.column.field == 'install_date'">
          {{ showDate(props.row.install_date) }}
          <q-tooltip>{{ diffForHumans(props.row.install_date) }}</q-tooltip>
        </span>

        <span v-else-if="props.column.field == 'uninstall_date'">
          {{ showDate(props.row.uninstall_date) }}
          <q-tooltip>{{ diffForHumans(props.row.uninstall_date) }}</q-tooltip>
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>

      <q-banner
        v-if="!isLoading"
        slot="emptystate"
        rounded
        class="bg-warning text-black"
      >
        <translate>There are no results</translate>
      </q-banner>

      <div slot="selected-row-actions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          color="info"
          text-color="black"
          icon="mdi-file-export"
          :loading="isLoadingExport"
          @click="exportData"
          ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
        >
      </div>

      <template slot="pagination-bottom" slot-scope="props">
        <TablePagination
          :total="props.total"
          :page-changed="props.pageChanged"
          :per-page-changed="props.perPageChanged"
          :pagination-options="paginationOptions"
        />
      </template>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import Header from 'components/ui/Header'
import TablePagination from 'components/ui/TablePagination'
import DateRangeInput from 'components/ui/DateRangeInput'
import MigasLink from 'components/MigasLink'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Packages History List'),
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    TablePagination,
    DateRangeInput,
    MigasLink,
  },
  mixins: [dateMixin, elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Packages History'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search',
        },
        {
          text: this.$gettext('Packages History'),
          icon: 'mdi-history',
          to: 'packages-history-dashboard',
        },
        {
          text: this.$gettext('Results'),
        },
      ],
      columns: [
        {
          field: 'id',
          hidden: true,
        },
        {
          field: 'computer.id',
          hidden: true,
        },
        {
          field: 'computer.status',
          hidden: true,
        },
        {
          field: 'computer.summary',
          hidden: true,
        },
        {
          label: this.$gettext('Computer'),
          field: 'computer.__str__',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter',
          },
        },
        {
          field: 'package.id',
          hidden: true,
        },
        {
          label: this.$gettext('Package'),
          field: 'package.fullname',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
          },
        },
        {
          field: 'package.project.id',
          hidden: true,
        },
        {
          label: this.$gettext('Project'),
          field: 'package.project.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
          },
        },
        {
          label: this.$gettext('Install Date'),
          field: 'install_date',
        },
        {
          label: this.$gettext('Uninstall Date'),
          field: 'uninstall_date',
        },
      ],
      tableFilters: {
        search: '',
        installDateRange: {
          selected: { from: null, to: null },
        },
        uninstallDateRange: {
          selected: { from: null, to: null },
        },
        uninstallDate: {
          items: [
            { id: '', name: this.$gettext('All') },
            { id: 1, name: this.$gettext('without date') },
            { id: 0, name: this.$gettext('with date') },
          ],
          selected: null,
        },
      },
      model: 'packages-history',
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/projects/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'package.project.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name,
              }
            }
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    onInstallDateRangeFilter(params) {
      this.tableFilters.installDateRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          install_date__gte: this.tableFilters.installDateRange.selected.from
            ? this.tableFilters.installDateRange.selected.from + 'T00:00:00'
            : '',
          install_date__lt: this.tableFilters.installDateRange.selected.to
            ? this.tableFilters.installDateRange.selected.to + 'T23:59:59'
            : '',
        }),
      })
      this.loadItems()
    },

    onUninstallDateRangeFilter(params) {
      this.tableFilters.uninstallDateRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          uninstall_date__gte: this.tableFilters.uninstallDateRange.selected
            .from
            ? this.tableFilters.uninstallDateRange.selected.from + 'T00:00:00'
            : '',
          uninstall_date__lt: this.tableFilters.uninstallDateRange.selected.to
            ? this.tableFilters.uninstallDateRange.selected.to + 'T23:59:59'
            : '',
        }),
      })
      this.loadItems()
    },

    onUninstallDateFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          uninstall_date: params.id ? true : params.id === 0 ? false : '',
        }),
      })
      this.loadItems()
    },
  },
}
</script>
