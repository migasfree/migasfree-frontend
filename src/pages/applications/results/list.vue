<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      :add-routes="[{ route: 'app-add' }]"
    />

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
            :model="model"
            :pk="props.row.id"
            :value="props.row.name"
            icon="mdi-apps"
          />
        </span>

        <span v-else-if="props.column.field == 'score'">
          <q-rating
            v-model="props.row.score"
            icon="star_border"
            icon-selected="star"
            readonly
          />
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
import MigasLink from 'components/MigasLink'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Applications List')
    }
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
      title: this.$gettext('Applications'),
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
          text: this.$gettext('Applications'),
          icon: 'mdi-apps',
          to: 'apps-dashboard'
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
          label: this.$gettext('Score'),
          field: 'score',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'level.id',
          hidden: true
        },
        {
          label: this.$gettext('Level'),
          field: 'level.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'category.id',
          hidden: true
        },
        {
          label: this.$gettext('Category'),
          field: 'category.name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        }
      ],
      model: 'catalog/apps',
      detailRoute: 'app-detail'
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/catalog/apps/levels')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'level.name'
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data
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

      await this.$axios
        .get('/api/v1/token/catalog/apps/categories')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'category.name'
          ).filterOptions.filterDropdownItems = Object.entries(
            response.data
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

      this.columns.find(
        (x) => x.field === 'score'
      ).filterOptions.filterDropdownItems = ['1', '2', '3', '4', '5']
    }
  }
}
</script>
