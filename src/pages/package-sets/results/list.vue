<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      :add-routes="[{ route: 'package-set-add' }]"
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
      <span slot="loadingContent" class="vgt-loading__content">
        <q-spinner size="sm" />
        <translate>Loading data...</translate>
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
            model="package-sets"
            :pk="props.row.id"
            :value="props.row.name"
            icon="mdi-apps-box"
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

        <span v-else-if="props.column.field == 'store.name'">
          <MigasLink
            v-if="props.row.store.id > 0"
            model="stores"
            :pk="props.row.store.id"
            :value="props.row.store.name"
            icon="mdi-store-24-hour"
          />
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>

      <q-banner
        v-if="!isLoading"
        slot="emptystate"
        rounded
        class="bg-warning text-black"
      >
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
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Package Sets List'),
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    TablePagination,
    MigasLink,
  },
  mixins: [elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Package Sets'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Release'),
          icon: 'mdi-truck-delivery',
        },
        {
          text: this.$gettext('Package Sets'),
          icon: 'mdi-apps-box',
          to: 'packages-list',
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
          field: 'project.id',
          hidden: true,
        },
        {
          label: this.$gettext('Project'),
          field: 'project.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
          },
        },
        {
          field: 'store.id',
          hidden: true,
        },
        {
          label: this.$gettext('Store'),
          field: 'store.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
          },
        },
        {
          label: this.$gettext('Description'),
          field: 'description',
        },
      ],
      model: 'package-sets',
      detailRoute: 'package-set-detail',
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
                text: item.name,
              }
            }
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/stores/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'store.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: `${item.name} (${item.project.name})`,
              }
            }
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },
  },
}
</script>
