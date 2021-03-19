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
            <SelectTree
              ref="statusTree"
              v-model="tableFilters.statusIn.selected"
              :placeholder="$gettext('By Status')"
              prepend-icon="mdi-filter"
              :options="tableFilters.statusIn.items"
              @select="onStatusInFilter"
            />
          </div>

          <div class="col-6 col-md">
            <DateRangeInput
              ref="createdAtRange"
              v-model="tableFilters.createdAtRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Subscribed Date (range)')"
              @select="onCreatedAtRangeFilter"
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
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
            ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
          >
        </span>

        <span v-else-if="props.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="props.row.computer.id"
            :value="props.row.computer.__str__"
            :icon="elementIcon(props.row.computer.status)"
            :tooltip="props.row.computer.summary"
          />
        </span>

        <span v-else-if="props.column.field == 'created_at'">
          {{ showDate(props.row.created_at) }}
        </span>

        <span v-else-if="props.column.field == 'status'">
          {{ props.row.status }}
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
          color="negative"
          icon="mdi-delete"
          @click="confirmRemove"
          ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
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
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'
import MigasLink from 'components/MigasLink'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Status Logs List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    TablePagination,
    SelectTree,
    DateRangeInput,
    MigasLink
  },
  mixins: [dateMixin, elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Status Logs'),
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
          text: this.$gettext('Status Logs'),
          icon: 'mdi-flag-variant',
          to: 'status-logs-dashboard'
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
          label: this.$gettext('Date'),
          field: 'created_at'
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
          label: this.$gettext('Status'),
          field: 'status',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        }
      ],
      tableFilters: {
        search: '',
        statusIn: {
          items: [],
          selected: null,
          choices: {}
        },
        createdAtRange: {
          selected: { from: null, to: null }
        }
      },
      model: 'status-logs'
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/computers/status/')
        .then((response) => {
          this.updateStatusInFilter(response.data)

          this.columns.find(
            (x) => x.field === 'status'
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data.choices
          ).map(([key, val]) => {
            return {
              value: key,
              text: val
            }
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
