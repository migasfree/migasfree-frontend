<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      title="Plataformas"
      :results="totalRecords"
      @new="$router.push({ name: 'platform-add' })"
    />

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
            model="platforms"
            :pk="props.row.id"
            :value="props.row.name"
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
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta: {
    title: 'Platforms List'
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    MigasLink
  },
  mixins: [datagridMixin],
  data() {
    return {
      breadcrumbs: [
        {
          text: 'Dashboard',
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: 'Configuración',
          icon: 'mdi-cogs'
        },
        {
          text: 'Plataformas',
          icon: 'mdi-layers'
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
          label: 'Nombre',
          field: 'name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
            trigger: 'enter'
          }
        }
      ]
    }
  },
  created() {
    if (this.$route.query.platform_id) {
      this.updateParams({
        columnFilters: { platform_id: this.$route.query.platform_id }
      })
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

    paramsToQueryString() {
      let ret = `page_size=${this.serverParams.perPage}&page=${this.serverParams.page}`

      if (Object.keys(this.serverParams.columnFilters).length) {
        ret +=
          '&' +
          Object.entries(this.serverParams.columnFilters)
            .map(([key, val]) => {
              switch (key) {
                case 'platform_id':
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

    async loadItems() {
      if (this.isLoading) return

      this.isLoading = true
      await this.$axios
        .get('/api/v1/token/platforms/?' + this.paramsToQueryString())
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
      this.resetColumnFilters()
      this.tableFilters.search = ''
      this.loadItems()
    },

    edit(id) {
      this.$router.push({ name: 'platform-detail', params: { id } })
    },

    remove(id, reload = true) {
      this.$axios
        .delete(`/api/v1/token/platforms/${id}/`)
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
