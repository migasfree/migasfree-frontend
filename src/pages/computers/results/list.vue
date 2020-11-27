<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      title="Ordenadores"
      :results="totalRecords"
      :has-add-button="false"
    />

    <q-list bordered>
      <q-expansion-item icon="mdi-filter" label="More Filters">
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
              label="Por plataforma"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onPlatformFilter"
            >
              <template v-slot:before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.architecture.selected"
              :options="tableFilters.architecture.items"
              label="Por arquitectura"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onArchitectureFilter"
            >
              <template v-slot:before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.syncEndDate.selected"
              :options="tableFilters.syncEndDate.items"
              label="Por fecha de última sincronización"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onSyncEndDateFilter"
            >
              <template v-slot:before>
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
              label="Por inventario de software"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onSoftwareInventoryFilter"
            >
              <template v-slot:before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6">
            <SelectTree
              ref="statusTree"
              v-model="tableFilters.statusIn.selected"
              placeholder="Por estado"
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
              v-model="tableFilters.createdAt.selected"
              prepend-icon="mdi-filter"
              label="Por fecha de alta (rango)"
              @select="onCreatedAtFilter"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <DateRangeInput
              ref="syncEndDateRange"
              v-model="tableFilters.syncEndDateRange.selected"
              prepend-icon="mdi-filter"
              label="Por fecha de última sincronización (rango)"
              @select="onSyncEndDateRangeFilter"
            />
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <SelectTree
              ref="machineTree"
              v-model="tableFilters.machine.selected"
              placeholder="Por máquina"
              prepend-icon="mdi-filter"
              :options="tableFilters.machine.items"
              @select="onMachineFilter"
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
            model="computers"
            :pk="props.row.id"
            :icon="elementIcon(props.row.status)"
            :value="props.row.__str__ || ''"
            :tooltip="computerTooltip(props.row)"
          />
        </span>
        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
          />
        </span>
        <span v-else-if="props.column.field == 'sync_user.name'">
          <MigasLink
            model="users"
            :pk="props.row.sync_user.id"
            :value="props.row.sync_user.name || ''"
          />
        </span>
        <span v-else-if="props.column.field == 'product'">
          <MigasLink
            model="computers"
            :pk="props.row.id"
            :value="props.row.product || ''"
          />
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
      <div slot="emptystate">{{ $t('vgt.noData') }}</div>
      <div slot="selected-row-actions">
        <q-btn
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
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
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
          text: 'Ordenadores',
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic'
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
          label: 'Name',
          field: 'name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
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
          label: 'Project',
          field: 'project.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter'
          }
        },
        {
          field: 'sync_user.id',
          hidden: true
        },
        {
          label: 'User',
          field: 'sync_user.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
            trigger: 'enter'
          }
        },
        {
          label: 'Sync end Date',
          field: 'sync_end_date',
          type: 'date',
          dateInputFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSSSS",
          dateOutputFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        {
          label: 'Product',
          field: 'product',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
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
        architecture: {
          items: [
            { id: '', name: 'Todas' },
            { id: 32, name: '32 bits' },
            { id: 64, name: '64 bits' }
          ],
          selected: null
        },
        machine: {
          items: [
            { id: '', label: 'Todas' },
            {
              id: 'P',
              label: 'Físicas',
              children: [
                { id: 'desktop', label: 'desktop' },
                { id: 'laptop', label: 'portátil' }
              ]
            },
            {
              id: 'V',
              label: 'Virtuales',
              children: [
                { id: 'virtual', label: 'emulador' },
                { id: 'docker', label: 'contenedor' }
              ]
            }
          ],
          selected: null
        },
        syncEndDate: {
          items: [
            { id: '', name: 'Todas' },
            { id: 0, name: 'sin fecha' },
            { id: 7, name: 'hace 7 días' },
            { id: 30, name: 'hace 30 días' },
            { id: 60, name: 'hace 60 días' },
            { id: 180, name: 'hace 180 días' },
            { id: 365, name: 'hace 365 días' }
          ],
          selected: null
        },
        softwareInventory: {
          items: [
            { id: '', name: 'Todos' },
            { id: 0, name: 'sin inventario' }
          ],
          selected: null
        },
        statusIn: {
          items: [],
          selected: null,
          choices: {}
        },
        createdAt: {
          selected: { from: null, to: null }
        },
        syncEndDateRange: {
          selected: { from: null, to: null }
        }
      }
    }
  },
  created() {
    if (this.$route.query.name) {
      this.updateParams({ columnFilters: { name: this.$route.query.name } })
      this.columns[2].filterOptions.filterValue = this.$route.query.name
    }

    if (this.$route.query.platform_id) {
      this.updateParams({
        columnFilters: { platform: this.$route.query.platform_id }
      })
    }

    if (this.$route.query.project_id) {
      this.updateParams({
        columnFilters: { 'project.name': this.$route.query.project_id }
      })
      this.columns[5].filterOptions.filterValue = this.$route.query.project_id
    }

    if (this.$route.query.machine) {
      this.updateParams({
        columnFilters: { machine: this.$route.query.machine }
      })
      this.tableFilters.machine.selected = this.findById(
        this.tableFilters.machine.items,
        this.$route.query.machine
      ).label
    }

    if (this.$route.query.search) {
      this.updateParams({
        columnFilters: { search: this.$route.query.search }
      })
      this.tableFilters.search = this.$route.query.search
    }

    if (this.$route.query.status_in) {
      this.updateParams({
        columnFilters: { status_in: this.$route.query.status_in }
      })
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
  },
  methods: {
    onPlatformFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          platform: params.id
        })
      })
      this.loadItems()
    },

    onArchitectureFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          architecture: params.id
        })
      })
      this.loadItems()
    },

    onMachineFilter(params) {
      console.log(params)
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

    onStatusInFilter(params) {
      console.log('onstatusfilter', this.tableFilters.statusIn.selected)
      console.log(params)
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          status_in: params.id
        })
      })
      this.loadItems()
    },

    updateStatusInFilter(options) {
      this.tableFilters.statusIn.choices = options.choices

      this.tableFilters.statusIn.items = [
        { id: '', label: 'Todos' },
        {
          id: options.subscribed.join(','),
          label: 'subscribed',
          children: [
            {
              id: options.productive.join(','),
              label: 'productive',
              children: Object.entries(options.productive).map(([key, val]) => {
                return { id: val, label: options.choices[val] }
              })
            },
            {
              id: options.unproductive.join(','),
              label: 'unproductive',
              children: Object.entries(options.unproductive).map(
                ([key, val]) => {
                  return { id: val, label: options.choices[val] }
                }
              )
            }
          ]
        },
        { id: options.unsubscribed.join(','), label: 'unsubscribed' }
      ]

      if (this.$route.query.status_in) {
        this.tableFilters.statusIn.selected = this.findById(
          this.tableFilters.statusIn.items,
          this.$route.query.status_in
        ).label
      }
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
                case 'platform':
                case 'architecture':
                case 'machine':
                case 'product_system':
                case 'has_software_inventory':
                case 'search':
                case 'created_at__gte':
                case 'created_at__lt':
                case 'sync_end_date__gte':
                case 'sync_end_date__lt':
                  return `${key}=${val}`
                case 'status_in':
                  return `status__in=${val}`
                case 'sync_end_date':
                  if (val === 0) return `${key}__isnull=true`
                  else {
                    let d = new Date()
                    d = d.toISOString(d.setDate(d.getDate() - val))
                    return `${key}__lt=${d}`
                  }
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
          this.columns[5].filterOptions.filterDropdownItems = response.data.results.map(
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
          console.log(response)
          this.updateStatusInFilter(response.data)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async loadItems() {
      this.isLoading = true
      await this.$axios
        .get('/api/v1/token/computers/?' + this.paramsToQueryString())
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
      this.updateParams({ columnFilters: {} })
      this.tableFilters.platform.selected = null
      this.tableFilters.architecture.selected = null
      this.tableFilters.softwareInventory.selected = null
      this.tableFilters.syncEndDate.selected = null

      this.tableFilters.statusIn.selected = null
      this.$refs.statusTree.reset()

      this.tableFilters.createdAt.selected = { from: null, to: null }
      this.$refs.createdAtRange.reset()

      this.tableFilters.syncEndDateRange.selected = { from: null, to: null }
      this.$refs.syncEndDateRange.reset()

      this.tableFilters.machine.selected = null
      this.$refs.machineTree.reset()

      this.tableFilters.search = ''

      this.loadItems()
    },

    edit(id) {
      this.$router.push({ name: 'computer-detail', params: { id } })
    },

    remove(id, reload = true) {
      this.$axios
        .delete(`/api/v1/token/computers/${id}/`)
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Item deleted!')
          if (reload) this.loadItems()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    computerTooltip(info) {
      return [
        this.tableFilters.statusIn.choices[info.status],
        info.project.name,
        info.ip_address,
        info.sync_user.name
      ].join(', ')
    }
  }
}
</script>
