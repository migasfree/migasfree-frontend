<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <CrudHeading
      title="Atributos"
      :results="totalRecords"
      :has-add-button="false"
    />

    <SearchFilter @search="onSearch" @clear="onSearchClear" />

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
            round
            size="sm"
            icon="mdi-pencil"
            color="primary"
            @click="edit(props.row.id)"
          />
          <q-btn
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="remove(props.row.id)"
          />
        </span>
        <span v-else-if="props.column.field == 'value'">
          <MigasLink
            model="features"
            :pk="props.row.id"
            :icon="elementIcon(props.row.property_att.prefix)"
            :value="attributeValue(props.row)"
          />
        </span>
        <span v-else-if="props.column.field == 'property_att'">
          <MigasLink
            model="properties"
            :pk="props.row.property_att.id"
            :value="props.row.property_att.name || ''"
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
        <q-btn size="sm" color="negative" icon="mdi-delete"></q-btn>
      </div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import CrudHeading from 'components/ui/CrudHeading'
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  components: {
    Breadcrumbs,
    SearchFilter,
    CrudHeading,
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
          text: 'Atributos',
          icon: 'mdi-pound',
          to: 'attributes-dashboard'
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
          label: 'Attribute',
          field: 'value',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
            trigger: 'enter'
          }
        },
        {
          label: 'Description',
          field: 'description'
        },
        {
          label: 'Total Computers',
          field: 'total_computers',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
            trigger: 'enter'
          }
        },
        {
          label: 'Formula',
          field: 'property_att',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter'
          }
        }
      ]
    }
  },
  methods: {
    onSearch(value) {
      /* this.tableFilters.search = value
      console.log(this.tableFilters.search)
      this.updateParams({
        columnFilters: { search: this.tableFilters.search }
      })
      this.loadItems()*/
    },

    onSearchClear() {
      this.onSearch('')
    },

    paramsToQueryString() {
      let ret = `page_size=${this.serverParams.perPage}&page=${this.serverParams.page}`

      if (this.serverParams.sort.field) {
        ret += `&ordering=${this.serverParams.sort.type}${this.serverParams.sort.field}`
      }

      console.log(ret)
      return ret
    },

    async loadItems() {
      await this.$axios
        .get('/api/v1/token/features/?' + this.paramsToQueryString())
        .then((response) => {
          console.log(response)
          this.totalRecords = response.data.count
          this.rows = response.data.results
        })
        .catch((error) => {
          console.error(error)
          this.$store.dispatch(
            'ui/notifyError',
            error.response.data.detail || error.response.data
          )
        })
    }
  }
}
</script>
