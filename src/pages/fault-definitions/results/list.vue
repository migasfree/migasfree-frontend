<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      :add-routes="[{ route: 'fault-definition-add' }]"
    >
      <template #append>
        <q-btn
          class="q-ma-sm float-right"
          color="info"
          text-color="black"
          :label="$gettext('Export')"
          icon="mdi-file-export"
          :loading="isLoadingExport"
          @click="exportAll"
        />
      </template>
    </Header>

    <SearchFilter
      v-model="tableFilters.search"
      @search="onSearch"
      @clear="onSearchClear"
    />

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
            icon="mdi-pencil"
            color="primary"
            @click="edit(props.row.id)"
            ><q-tooltip>{{ $gettext('Edit') }}</q-tooltip></q-btn
          >
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

        <span v-else-if="props.column.field == 'name'">
          <MigasLink
            model="fault-definitions"
            :pk="props.row.id"
            :value="props.row.name"
            icon="mdi-alert-octagram-outline"
          />
        </span>

        <span v-else-if="props.column.field == 'enabled'">
          <BooleanView v-model="props.row.enabled" />
        </span>

        <span v-else-if="props.column.field == 'language'">
          {{ languages[props.row.language].name }}
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
          color="info"
          text-color="black"
          icon="mdi-file-export"
          :loading="isLoadingExport"
          @click="exportData"
          ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
        >
        <q-btn
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
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Fault Definitions List'),
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    TablePagination,
    BooleanView,
    MigasLink,
  },
  mixins: [datagridMixin],
  data() {
    return {
      title: this.$gettext('Fault Definitions'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs',
        },
        {
          text: this.$gettext('Fault Definitions'),
          icon: 'mdi-alert-octagram-outline',
        },
        {
          text: this.$gettext('Results'),
        },
      ],
      columns: [
        {
          field: 'id',
          hidden: true,
        },
        {
          label: this.$gettext('Actions'),
          field: 'actions',
          html: true,
          sortable: false,
          globalSearchDisabled: true,
        },
        {
          label: this.$gettext('Name'),
          field: 'name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter',
          },
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
              { value: false, text: this.$gettext('No') },
            ],
          },
        },
        {
          label: this.$gettext('Language'),
          field: 'language',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
          },
        },
      ],
      model: 'fault-definitions',
      detailRoute: 'fault-definition-detail',
      kind: {},
      languages: [],
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get(`/api/v1/public/languages/`)
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.languages.push({
              id: parseInt(key),
              name: val,
            })
          })

          this.columns.find(
            (x) => x.field === 'language'
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data
          ).map(([key, val]) => {
            return {
              value: parseInt(key),
              text: val,
            }
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },
  },
}
</script>
