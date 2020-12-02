<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      title="Sincronizaciones"
      :results="totalRecords"
      :has-add-button="false"
    />

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" label="More Filters">
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
              label="Por plataforma"
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
              v-model="tableFilters.startDate.selected"
              prepend-icon="mdi-filter"
              label="Por fecha de inicio (rango)"
              @select="onStartDateFilter"
            />
          </div>

          <div class="col-4 col-md">
            <DateRangeInput
              ref="createdAtRange"
              v-model="tableFilters.createdAt.selected"
              prepend-icon="mdi-filter"
              label="Por fecha de finalización (rango)"
              @select="onCreatedAtFilter"
            />
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-btn @click="resetFilters">Reset all filters</q-btn>
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
        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
          />
        </span>
        <span v-else-if="props.column.field == 'user.name'">
          <MigasLink
            model="users"
            :pk="props.row.user.id"
            :value="props.row.user.name"
          />
        </span>
        <span v-else-if="props.column.field == 'created_at'">
          {{ showDate(props.row.created_at) }}
          <DateDiff
            v-if="props.row.created_at && props.row.start_date"
            class="float-right"
            :begin="new Date(props.row.start_date)"
            :end="new Date(props.row.created_at)"
            tooltip="duration"
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
      <div slot="emptystate">{{ $t('vgt.noData') }}</div>
      <div slot="selected-row-actions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          color="negative"
          icon="mdi-delete"
          @click="confirmRemove"
        ></q-btn>
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
  meta: {
    title: 'Syncs List'
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
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Datos',
          icon: 'mdi-database-search'
        },
        {
          text: 'Sincronizaciones',
          icon: 'mdi-sync',
          to: 'syncs-dashboard'
        },
        {
          text: 'Resultados'
        }
      ],
      columns: [
        {
          field: 'id',
          hidden: true
        },
        {
          label: 'Actions',
          field: 'actions',
          html: true,
          sortable: false,
          globalSearchDisabled: true
        },
        {
          label: 'Fecha de inicio',
          field: 'start_date'
        },
        {
          label: 'Fecha de finalización',
          field: 'created_at'
        },
        {
          field: 'user.id',
          hidden: true
        },
        {
          label: 'Usuario',
          field: 'user.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
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
          label: 'Ordenador',
          field: 'computer.__str__',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'project.id',
          hidden: true
        },
        {
          label: 'Proyecto',
          field: 'project.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter'
          }
        },
        {
          label: 'PMS Status Ok',
          field: 'pms_status_ok',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter',
            filterDropdownItems: [
              { value: true, text: 'Sí' },
              { value: false, text: 'No' }
            ]
          }
        },
        {
          label: 'Consumidor',
          field: 'consumer',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter'
          }
        }
      ],
      tableFilters: {
        search: '',
        platform: {
          items: [{ id: '', name: 'Todas' }],
          selected: null
        },
        createdAt: {
          selected: { from: null, to: null }
        },
        startDate: {
          selected: { from: null, to: null }
        }
      }
    }
  },
  created() {
    if (this.$route.query.platform_id) {
      this.updateParams({
        columnFilters: { platform: this.$route.query.platform_id }
      })
    }

    if (this.$route.query.project_id) {
      this.updateParams({
        columnFilters: { 'project.name': this.$route.query.project_id }
      })
      this.columns.find(
        (x) => x.field === 'project.name'
      ).filterOptions.filterValue = this.$route.query.project_id
    }

    if ('pms_status_ok' in this.$route.query) {
      this.updateParams({
        columnFilters: { pms_status_ok: this.$route.query.pms_status_ok }
      })
      this.columns.find(
        (x) => x.field === 'pms_status_ok'
      ).filterOptions.filterValue = this.$route.query.pms_status_ok
    }

    if (this.$route.query.created_at__gte && this.$route.query.created_at__lt) {
      this.updateParams({
        columnFilters: {
          created_at__gte: this.$route.query.created_at__gte,
          created_at__lt: this.$route.query.created_at__lt
        }
      })
      this.tableFilters.createdAt.selected = {
        from: this.$route.query.created_at__gte,
        to: this.$route.query.created_at__lt
      }
    }

    if (this.$route.query.search) {
      this.updateParams({
        columnFilters: { search: this.$route.query.search }
      })
      this.tableFilters.search = this.$route.query.search
    }
  },
  methods: {
    onSearch(value) {
      this.tableFilters.search = value
      console.log(this.tableFilters.search)
      this.updateParams({
        columnFilters: { search: this.tableFilters.search }
      })
      this.loadItems()
    },

    onSearchClear() {
      this.onSearch('')
    },

    onPlatformFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          platform: params.id
        })
      })
      this.loadItems()
    },

    onCreatedAtFilter(params) {
      console.log(params)
      console.log('createdAt selected', this.tableFilters.createdAt.selected)
      this.tableFilters.createdAt.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          created_at__gte: this.tableFilters.createdAt.selected.from,
          created_at__lt: this.tableFilters.createdAt.selected.to
        })
      })
      this.loadItems()
    },

    onStartDateFilter(params) {
      console.log(params)
      this.tableFilters.startDate.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          start_date__gte: this.tableFilters.startDate.selected.from,
          start_date__lt: this.tableFilters.startDate.selected.to
        })
      })
      this.loadItems()
    },

    paramsToQueryString() {
      let ret = `page_size=${this.serverParams.perPage}&page=${this.serverParams.page}`

      if (Object.keys(this.serverParams.columnFilters).length) {
        ret +=
          '&' +
          Object.entries(this.serverParams.columnFilters)
            .map(([key, val]) => {
              switch (key) {
                case 'project.name':
                  return `project__id=${val}`
                case 'computer.__str__':
                  return `computer__name__icontains=${val}`
                case 'platform':
                  return `project__platform__id=${val}`
                case 'pms_status_ok':
                case 'created_at__gte':
                case 'created_at__lt':
                case 'start_date__gte':
                case 'start_date__lt':
                case 'search':
                  return `${key}=${val}`
                default:
                  return `${key.replace('.', '__')}__icontains=${val}`
              }
            })
            .join('&')
      }

      if (this.serverParams.sort.field) {
        ret += `&ordering=${this.serverParams.sort.type}${this.serverParams.sort.field}`
      }

      console.log(ret)
      return ret
    },

    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/platforms/')
        .then((response) => {
          console.log('plataformas', response.data.results)
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
          console.log(response)
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
    },

    async loadItems() {
      if (this.isLoading) return

      this.isLoading = true
      await this.$axios
        .get('/api/v1/token/syncs/?' + this.paramsToQueryString())
        .then((response) => {
          console.log(response)
          this.totalRecords = response.data.count
          this.rows = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.isLoading = false))
    },

    resetFilters() {
      this.$refs.myTable.reset()
      this.resetColumnFilters()
      this.tableFilters.search = ''
      this.tableFilters.platform.selected = null

      this.tableFilters.createdAt.selected = { from: null, to: null }
      this.$refs.createdAtRange.reset()

      this.tableFilters.startDate.selected = { from: null, to: null }
      this.$refs.startDateRange.reset()

      this.loadItems()
    },

    remove(id, reload = true) {
      this.$axios
        .delete(`/api/v1/token/syncs/${id}/`)
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Item deleted!')
          if (reload) this.loadItems()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
