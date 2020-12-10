<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      title="Paquetes"
      :results="totalRecords"
      @new="$router.push({ name: 'package-add' })"
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
        <span v-else-if="props.column.field == 'fullname'">
          <MigasLink
            model="packages"
            :pk="props.row.id"
            icon="mdi-package-variant"
            :value="props.row.fullname"
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
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta: {
    title: 'Packages List'
  },
  components: {
    Breadcrumbs,
    SearchFilter,
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
          text: 'Liberación',
          icon: 'mdi-truck-delivery'
        },
        {
          text: 'Paquetes',
          icon: 'mdi-package-variant',
          to: 'packages-dashboard'
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
          label: 'Paquete',
          field: 'fullname',
          html: true,
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
          field: 'store.id',
          hidden: true
        },
        {
          label: 'Store',
          field: 'store.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter'
          }
        }
      ],
      model: 'packages',
      detailRoute: 'package-detail'
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
        .get('/api/v1/token/stores/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'store.name'
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
