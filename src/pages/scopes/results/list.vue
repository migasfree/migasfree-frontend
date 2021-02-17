<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      :add-routes="[{ route: 'scope-add' }]"
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
            model="scopes"
            :pk="props.row.id"
            :value="props.row.name"
            icon="mdi-eye-outline"
          />
        </span>

        <span v-else-if="props.column.field == 'domain.name'">
          <MigasLink
            v-if="props.row.domain"
            model="domains"
            :pk="props.row.domain.id"
            :value="props.row.domain.name"
            icon="mdi-earth"
          />
        </span>

        <span v-else-if="props.column.field == 'user.username'">
          <MigasLink
            model="user-profiles"
            :pk="props.row.user.id"
            :value="props.row.user.username"
            icon="mdi-account-cog"
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
      title: this.$gettext('Scopes List')
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
      title: this.$gettext('Scopes'),
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
          text: this.$gettext('Scopes'),
          icon: 'mdi-eye-outline'
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
          field: 'domain.id',
          hidden: true
        },
        {
          label: this.$gettext('Domain'),
          field: 'domain.name',
          html: true
        },
        {
          label: this.$gettext('User Profile'),
          field: 'user.username',
          hidden: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        }
      ],
      model: 'scopes',
      detailRoute: 'scope-detail'
    }
  },
  created() {
    if (this.$store.getters['auth/user'].is_superuser) {
      this.columns.find((x) => x.field === 'user.username').hidden = false
    } else
      this.updateParams({
        columnFilters: { user: this.$store.getters['auth/user'].pk }
      })
  }
}
</script>
