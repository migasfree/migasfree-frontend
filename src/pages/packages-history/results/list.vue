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
          <div class="col-6 col-md">
            <DateRangeInput
              ref="installDateRange"
              v-model="tableFilters.installDateRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Install Date (range)')"
              @select="onInstallDateRangeFilter"
            />
          </div>

          <div class="col-6 col-md">
            <DateRangeInput
              ref="uninstallDateRange"
              v-model="tableFilters.uninstallDateRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Uninstall Date (range)')"
              @select="onUninstallDateRangeFilter"
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
      :pagination-options="paginationOptions"
      :search-options="searchOptions"
      style-class="vgt-table striped condensed"
      @on-page-change="onPageChange"
      @on-sort-change="onSortChange"
      @on-column-filter="onColumnFilter"
      @on-per-page-change="onPerPageChange"
      @on-selected-rows-change="onSelectionChanged"
    >
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
        <span v-else-if="props.column.field == 'install_date'">
          {{ showDate(props.row.install_date) }}
        </span>
        <span v-else-if="props.column.field == 'uninstall_date'">
          {{ showDate(props.row.uninstall_date) }}
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
      <div slot="emptystate" v-translate>There are no results</div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import Header from 'components/ui/Header'
import DateRangeInput from 'components/ui/DateRangeInput'
import MigasLink from 'components/MigasLink'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Packages History List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    DateRangeInput,
    MigasLink
  },
  mixins: [dateMixin, elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Packages History'),
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
          text: this.$gettext('Packages History'),
          icon: 'mdi-history',
          to: 'packages-history-list'
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
          field: 'computer.id',
          hidden: true
        },
        {
          field: 'computer.status',
          hidden: true
        },
        {
          field: 'computer.summary',
          hidden: true
        },
        {
          label: this.$gettext('Computer'),
          field: 'computer.__str__',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'package.id',
          hidden: true
        },
        {
          label: this.$gettext('Package'),
          field: 'package.fullname',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Install Date'),
          field: 'install_date'
        },
        {
          label: this.$gettext('Uninstall Date'),
          field: 'uninstall_date'
        }
      ],
      tableFilters: {
        search: '',
        installDateRange: {
          selected: { from: null, to: null }
        },
        uninstallDateRange: {
          selected: { from: null, to: null }
        }
      },
      model: 'packages-history'
    }
  },
  methods: {
    onInstallDateRangeFilter(params) {
      this.tableFilters.installDateRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          install_date__gte:
            this.tableFilters.installDateRange.selected.from + 'T00:00:00',
          install_date__lt:
            this.tableFilters.installDateRange.selected.to + 'T23:59:59'
        })
      })
      this.loadItems()
    },

    onUninstallDateRangeFilter(params) {
      this.tableFilters.uninstallDateRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          uninstall_date__gte:
            this.tableFilters.uninstallDateRange.selected.from + 'T00:00:00',
          uninstall_date__lt:
            this.tableFilters.uninstallDateRange.selected.to + 'T23:59:59'
        })
      })
      this.loadItems()
    }
  }
}
</script>
