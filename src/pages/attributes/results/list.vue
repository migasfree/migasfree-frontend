<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :results="totalRecords" :has-add-button="false" />

    <SearchFilter
      v-model="tableFilters.search"
      @search="onSearch"
      @clear="onSearchClear"
    />

    <div class="row q-pa-md">
      <div class="col-12">
        <q-btn @click="resetFilters"
          ><translate>Reset all filters</translate></q-btn
        >
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
  meta() {
    return {
      title: this.$gettext('Attributes List')
    }
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
      title: this.$gettext('Attributes'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Attributes'),
          icon: 'mdi-pound',
          to: 'attributes-dashboard'
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
          label: this.$gettext('Attribute'),
          field: 'value',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Description'),
          field: 'description',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Formula'),
          field: 'property_att',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        }
      ],
      model: 'features',
      detailRoute: 'attribute-detail'
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/formulas/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'property_att'
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
