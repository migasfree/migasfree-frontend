<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      @new="$router.push({ name: 'deployment-add' })"
    />

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" :label="$gettext('More Filters')">
        <SearchFilter
          v-model="tableFilters.search"
          @search="onSearch"
          @clear="onSearchClear"
        />

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.schedule.selected"
              :options="tableFilters.schedule.items"
              :label="$gettext('By Schedule')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onScheduleFilter"
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
            icon="mdi-pencil"
            color="primary"
            @click="edit(props.row.id)"
          />
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
          />
        </span>
        <span v-else-if="props.column.field == 'name'">
          <MigasLink
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
            icon="mdi-rocket-launch"
          />
        </span>
        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name"
            icon="mdi-sitemap"
          />
        </span>
        <span v-else-if="props.column.field == 'domain.name'">
          <MigasLink
            v-if="props.row.domain"
            model="domains"
            :pk="props.row.domain.id"
            :value="props.row.domain.name"
            icon="mdi-earth"
          />
        </span>
        <span v-else-if="props.column.field == 'schedule.name'">
          <MigasLink
            v-if="props.row.schedule"
            model="schedules"
            :pk="props.row.schedule.id"
            :value="props.row.schedule.name"
            icon="mdi-calendar-start"
          />
        </span>
        <span v-else-if="props.column.field == 'enabled'">
          <BooleanView v-model="props.row.enabled" />
        </span>
        <span v-else-if="props.column.field == 'start_date'">
          {{ showDate(props.row.start_date, 'YYYY-MM-DD') }}
        </span>
        <span v-else-if="props.column.field == 'source'">
          {{ resolveSource(props.row.source) }}
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
      <div slot="emptystate" v-translate>There are no results</div>
      <div slot="selected-row-actions">
        <q-btn
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
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'
import { datagridMixin } from 'mixins/datagrid'
import { dateMixin } from 'mixins/date'

export default {
  meta() {
    return {
      title: this.$gettext('Deployments List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    BooleanView,
    MigasLink
  },
  mixins: [datagridMixin, dateMixin],
  data() {
    return {
      title: this.$gettext('Deployments'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Release'),
          icon: 'mdi-truck-delivery'
        },
        {
          text: this.$gettext('Deployments'),
          icon: 'mdi-rocket-launch',
          to: 'deployments-dashboard'
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
          field: 'project.id',
          hidden: true
        },
        {
          label: this.$gettext('Project'),
          field: 'project.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'domain.id',
          hidden: true
        },
        {
          label: this.$gettext('Domain'),
          field: 'domain.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Source'),
          field: 'source',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
            filterDropdownItems: [
              { value: 'I', text: this.$gettext('Internal') },
              { value: 'E', text: this.$gettext('External') }
            ]
          }
        },
        {
          label: this.$gettext('Enabled'),
          field: 'enabled',
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
          label: this.$gettext('Start Date'),
          field: 'start_date'
        },
        {
          field: 'schedule.id',
          hidden: true
        },
        {
          label: this.$gettext('Schedule'),
          field: 'schedule.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        }
      ],
      tableFilters: {
        search: '',
        schedule: {
          items: [
            { id: '', name: this.$gettext('All') },
            { id: 1, name: this.$gettext('without schedule') },
            { id: 0, name: this.$gettext('with schedule') }
          ],
          selected: null
        }
      },
      model: 'deployments',
      detailRoute: 'deployment-detail'
    }
  },
  methods: {
    async loadFilters() {
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
        .get('/api/v1/token/domains/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'domain.name'
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
        .get('/api/v1/token/schedules/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'schedule.name'
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
    },

    onScheduleFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          schedule: params.id ? true : params.id === 0 ? false : ''
        })
      })
      this.loadItems()
    },

    resolveSource(value) {
      switch (value) {
        case 'I':
          return this.$gettext('Internal')
        case 'E':
          return this.$gettext('External')
        default:
          return ''
      }
    }
  }
}
</script>
