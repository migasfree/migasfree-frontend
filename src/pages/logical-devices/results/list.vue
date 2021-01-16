<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      @new="$router.push({ name: 'logical-device-add' })"
    />

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" :label="$gettext('More Filters')">
        <SearchFilter
          v-model="tableFilters.search"
          @search="onSearch"
          @clear="onSearchClear"
        />

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.model.selected"
              :options="tableFilters.model.items"
              :label="$gettext('By Model')"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onModelFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-btn
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
        <span v-else-if="props.column.field == '__str__'">
          <MigasLink
            model="devices/logical"
            :pk="props.row.id"
            :value="props.row.__str__"
            icon="mdi-printer-settings"
          />
        </span>
        <span v-else-if="props.column.field == 'device.name'">
          <MigasLink
            model="devices/devices"
            :pk="props.row.device.id"
            :value="props.row.device.name"
            icon="mdi-printer"
          />
        </span>
        <span v-else-if="props.column.field == 'capability.name'">
          <MigasLink
            model="devices/capabilities"
            :pk="props.row.capability.id"
            :value="props.row.capability.name"
            icon="mdi-format-list-bulleted-type"
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
import MigasLink from 'components/MigasLink'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Logical Devices List')
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
      title: this.$gettext('Logical Devices'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Devices'),
          icon: 'mdi-printer-eye'
        },
        {
          text: this.$gettext('Logical Devices'),
          icon: 'mdi-printer-settings'
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
          label: this.$gettext('Logical Device'),
          field: '__str__',
          html: true
        },
        {
          field: 'device.id',
          hidden: true
        },
        {
          label: this.$gettext('Device'),
          field: 'device.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'capability.id',
          hidden: true
        },
        {
          label: this.$gettext('Capability'),
          field: 'capability.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Alternative Capability Name'),
          field: 'alternative_capability_name'
        }
      ],
      tableFilters: {
        search: '',
        model: {
          items: [{ id: '', name: this.$gettext('All') }],
          selected: null
        }
      },
      model: 'devices/logical',
      detailRoute: 'logical-device-detail'
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/devices/models/')
        .then((response) => {
          this.tableFilters.model.items = this.tableFilters.model.items.concat(
            response.data.results
          )

          if (this.$route.query.model_id) {
            this.tableFilters.model.selected = this.tableFilters.model.items.find(
              (x) => x.id == this.$route.query.model_id
            )
          }
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/devices/capabilities/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'capability.name'
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
    },

    onModelFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          model: params.id
        })
      })
      this.loadItems()
    }
  }
}
</script>
