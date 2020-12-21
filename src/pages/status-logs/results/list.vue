<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :results="totalRecords" :has-add-button="false" />

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
              v-model="tableFilters.createdAt.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Subscribed Date (range)')"
              @select="onCreatedAtFilter"
            />
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-btn
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
      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'actions'">
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
          />
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
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
      <div slot="emptystate" v-translate>There are no results</div>
      <div slot="selected-row-actions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          color="negative"
          icon="mdi-delete"
          @click="confirmRemove"
        />
      </div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import Header from 'components/ui/Header'
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
        createdAt: {
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

          console.log(response.data)
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
    },

    queryParams() {
      let ret = {
        page_size: this.serverParams.perPage,
        page: this.serverParams.page
      }

      if (this.serverParams.sort.field) {
        ret.ordering = `${this.serverParams.sort.type}${this.serverParams.sort.field}`
      }

      if (Object.keys(this.serverParams.columnFilters).length) {
        Object.entries(this.serverParams.columnFilters).map(([key, val]) => {
          switch (key) {
            case 'computer.__str__':
              ret.computer__name__icontains = val
              break
            case 'computer_id':
              ret.computer__id = val
              break
            case 'status':
            case 'status_in':
              ret.status__in = val
              break
            case 'created_at__gte':
            case 'created_at__lt':
            case 'search':
              ret[key] = val
              break
            default:
              ret[`${key.replace('.', '__')}__icontains`] = val
          }
        })
      }

      return ret
    }
  }
}
</script>
