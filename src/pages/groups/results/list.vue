<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      @new="$router.push({ name: 'group-add' })"
    />

    <SearchFilter
      v-model="tableFilters.search"
      @search="onSearch"
      @clear="onSearchClear"
    />

    <div class="row q-pa-md">
      <div class="col-12">
        <q-btn :label="$gettext('Reset all filters')" @click="resetFilters" />
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
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Groups List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
  },
  mixins: [datagridMixin],
  data() {
    return {
      title: this.$gettext('Groups'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs'
        },
        {
          text: this.$gettext('Groups'),
          icon: 'mdi-account-group'
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
      ],
      model: 'accounts/groups',
      detailRoute: 'group-detail'
    }
  }
}
</script>