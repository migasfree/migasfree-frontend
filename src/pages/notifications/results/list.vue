<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :results="totalRecords">
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

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" :label="$gettext('More Filters')">
        <SearchFilter
          v-model="tableFilters.search"
          @search="onSearch"
          @clear="onSearchClear"
        />

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-md">
            <DateRangeInput
              ref="createdAtRange"
              v-model="tableFilters.createdAtRange.selected"
              prepend-icon="mdi-filter"
              :label="$gettext('By Subscribed Date (range)')"
              @select="onCreatedAtRangeFilter"
            />
          </div>
        </div>

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
      <span slot="loadingContent" class="vgt-loading__content">
        <q-spinner size="sm" />
        <translate>Loading data...</translate>
      </span>

      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'actions'">
          <q-btn
            v-if="!props.row.checked"
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-eye-check"
            color="positive"
            @click="updateChecked(props.row.id, true)"
            ><q-tooltip><translate>Check</translate></q-tooltip></q-btn
          >
          <q-btn
            v-if="props.row.checked"
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-eye-remove"
            color="negative"
            @click="updateChecked(props.row.id, false)"
            ><q-tooltip><translate>Not Check</translate></q-tooltip></q-btn
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

        <span v-else-if="props.column.field == 'created_at'">
          {{ showDate(props.row.created_at) }}
          <q-tooltip>{{ diffForHumans(props.row.created_at) }}</q-tooltip>
        </span>

        <span v-else-if="props.column.field == 'checked'">
          <BooleanView v-model="props.row.checked" />
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
          class="q-ma-xs"
          size="sm"
          icon="mdi-eye-check"
          color="positive"
          @click="updateItemsChecked(true)"
          ><q-tooltip><translate>Check</translate></q-tooltip></q-btn
        >
        <q-btn
          class="q-ma-xs"
          size="sm"
          icon="mdi-eye-remove"
          color="negative"
          @click="updateItemsChecked(false)"
          ><q-tooltip><translate>Not Check</translate></q-tooltip></q-btn
        >
        <q-btn
          class="q-ma-xs"
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
import DateRangeInput from 'components/ui/DateRangeInput'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Errors List'),
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    TablePagination,
    BooleanView,
    DateRangeInput,
  },
  mixins: [dateMixin, elementMixin, datagridMixin],
  data() {
    return {
      title: this.$gettext('Notifications'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home',
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search',
        },
        {
          text: this.$gettext('Notifications'),
          icon: 'mdi-android-messages',
          to: 'notifications-dashboard',
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
          label: this.$gettext('Date'),
          field: 'created_at',
        },
        {
          label: this.$gettext('Checked'),
          field: 'checked',
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
          label: this.$gettext('Message'),
          field: 'message',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter',
          },
        },
      ],
      tableFilters: {
        search: '',
        createdAtRange: {
          selected: { from: null, to: null },
        },
      },
      model: 'notifications',
    }
  },
}
</script>
