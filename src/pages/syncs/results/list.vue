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
          <div class="col-4 col-md">
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

          <div class="col-4 col-md">
            <DateRangeInput
              ref="startDateRange"
              v-model="tableFilters.startDateRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Start Date (range)')"
              @select="onStartDateRangeFilter"
            />
          </div>

          <div class="col-4 col-md">
            <DateRangeInput
              ref="createdAtRange"
              v-model="tableFilters.createdAtRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By End Date (range)')"
              @select="onCreatedAtRangeFilter"
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
        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
            icon="mdi-sitemap"
          />
        </span>
        <span v-else-if="props.column.field == 'user.name'">
          <MigasLink
            model="users"
            :pk="props.row.user.id"
            :value="props.row.user.__str__"
            icon="mdi-account"
          />
        </span>
        <span v-else-if="props.column.field == 'created_at'">
          {{ showDate(props.row.created_at) }}
          <DateDiff
            v-if="props.row.created_at && props.row.start_date"
            class="float-right"
            :begin="new Date(props.row.start_date)"
            :end="new Date(props.row.created_at)"
            :tooltip="$gettext('Duration')"
          />
        </span>
        <span v-else-if="props.column.field == 'start_date'">
          {{ showDate(props.row.start_date) }}
        </span>
        <span v-else-if="props.column.field == 'pms_status_ok'">
          <BooleanView v-model="props.row.pms_status_ok" />
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
          ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
        >
      </div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import Header from 'components/ui/Header'
import BooleanView from 'components/ui/BooleanView'
import DateRangeInput from 'components/ui/DateRangeInput'
import DateDiff from 'components/DateDiff'
import MigasLink from 'components/MigasLink'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Syncs List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    BooleanView,
    DateRangeInput,
    DateDiff,
    MigasLink
  },
  mixins: [dateMixin, elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Synchronizations'),
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
          text: this.$gettext('Synchronizations'),
          icon: 'mdi-sync',
          to: 'syncs-dashboard'
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
          label: this.$gettext('Start Date'),
          field: 'start_date'
        },
        {
          label: this.$gettext('End Date'),
          field: 'created_at'
        },
        {
          field: 'user.id',
          hidden: true
        },
        {
          label: this.$gettext('User'),
          field: 'user.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
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
          field: 'project.id',
          hidden: true
        },
        {
          label: this.$gettext('Project'),
          field: 'project.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('PMS Status Ok'),
          field: 'pms_status_ok',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
            filterDropdownItems: [
              { value: true, text: this.$gettext('Yes') },
              { value: false, text: this.$gettext('No') }
            ]
          }
        },
        {
          label: this.$gettext('Consumer'),
          field: 'consumer',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        }
      ],
      tableFilters: {
        search: '',
        platform: {
          items: [{ id: '', name: this.$gettext('All') }],
          selected: null
        },
        createdAtRange: {
          selected: { from: null, to: null }
        },
        startDateRange: {
          selected: { from: null, to: null }
        }
      },
      model: 'syncs'
    }
  },
  methods: {
    onStartDateRangeFilter(params) {
      this.tableFilters.startDateRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          start_date__gte: this.tableFilters.startDateRange.selected.from,
          start_date__lt: this.tableFilters.startDateRange.selected.to
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
    }
  }
}
</script>
