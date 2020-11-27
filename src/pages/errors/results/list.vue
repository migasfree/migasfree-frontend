<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Errores" :results="totalRecords" :has-add-button="false" />

    <SearchFilter
      v-model="tableFilters.search"
      @search="onSearch"
      @clear="onSearchClear"
    />

    <div class="row q-pa-md">
      <div class="col-12">
        <q-btn @click="resetFilters">Reset all filters</q-btn>
      </div>
    </div>

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
            v-if="!props.row.checked"
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-eye-check"
            color="positive"
            @click="updateChecked(props.row.id, true)"
            ><q-tooltip>Comprobar</q-tooltip></q-btn
          >
          <q-btn
            v-if="props.row.checked"
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-eye-remove"
            color="negative"
            @click="updateChecked(props.row.id, false)"
            ><q-tooltip>No comprobar</q-tooltip></q-btn
          >
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
        <span v-else-if="props.column.field == 'created_at'">
          {{ showDate(props.row.created_at) }}
        </span>
        <span v-else-if="props.column.field == 'description'">
          <Truncate v-model="props.row.description" />
        </span>
        <span v-else-if="props.column.field == 'checked'">
          <BooleanView v-model="props.row.checked" />
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
import Header from 'components/ui/Header'
import BooleanView from 'components/ui/BooleanView'
import Truncate from 'components/ui/Truncate'
import MigasLink from 'components/MigasLink'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    BooleanView,
    Truncate,
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
          text: 'Errores',
          icon: 'mdi-bug',
          to: 'errors-dashboard'
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
          label: 'Fecha',
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
          label: 'Ordenador',
          field: 'computer.__str__'
        },
        {
          field: 'project.id',
          hidden: true
        },
        {
          label: 'Proyecto',
          field: 'project.name'
        },
        {
          label: 'Comprobado',
          field: 'checked'
        },
        {
          label: 'Descripción',
          field: 'description',
          html: true
        }
      ]
    }
  },
  created() {
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

    paramsToQueryString() {
      let ret = `page_size=${this.serverParams.perPage}&page=${this.serverParams.page}`

      if (Object.keys(this.serverParams.columnFilters).length) {
        ret +=
          '&' +
          Object.entries(this.serverParams.columnFilters)
            .map(([key, val]) => {
              switch (key) {
                case 'property_att':
                  return `property_att__id=${val}`
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

    async loadFilters() {},

    async loadItems() {
      this.isLoading = true
      await this.$axios
        .get('/api/v1/token/errors/?' + this.paramsToQueryString())
        .then((response) => {
          console.log(response)
          this.totalRecords = response.data.count
          this.rows = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    },

    resetFilters() {
      this.$refs.myTable.reset()
      this.updateParams({ columnFilters: {} })
      this.tableFilters.search = ''
      this.loadItems()
    },

    edit(id) {
      this.$router.push({ name: 'error-detail', params: { id } })
    },

    remove(id) {
      this.$axios
        .delete(`/api/v1/token/errors/${id}/`)
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Item deleted!')
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    updateChecked(id, value) {
      this.$axios
        .patch(`/api/v1/token/errors/${id}/`, { checked: value })
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Changed item check value!')
          this.loadItems()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
