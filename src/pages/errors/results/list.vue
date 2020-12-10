<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header title="Errores" :results="totalRecords" :has-add-button="false" />

    <q-list class="more-filters" bordered>
      <q-expansion-item icon="mdi-filter" label="More Filters">
        <SearchFilter
          v-model="tableFilters.search"
          @search="onSearch"
          @clear="onSearchClear"
        />

        <div class="row q-pa-md q-col-gutter-lg">
          <div class="col-sm-6 col-md-4">
            <q-select
              v-model="tableFilters.platform.selected"
              :options="tableFilters.platform.items"
              label="Por plataforma"
              dense
              outlined
              option-value="id"
              option-label="name"
              @input="onPlatformFilter"
            >
              <template #before>
                <q-icon name="mdi-filter" />
              </template>
            </q-select>
          </div>

          <div class="col-md-4 col-sm-6">
            <SelectTree
              ref="statusTree"
              v-model="tableFilters.statusIn.selected"
              placeholder="Por estado"
              prepend-icon="mdi-filter"
              :options="tableFilters.statusIn.items"
              @select="onStatusInFilter"
            />
          </div>

          <div class="col-sm-6 col-md-4">
            <DateRangeInput
              ref="createdAtRange"
              v-model="tableFilters.createdAt.selected"
              prepend-icon="mdi-filter"
              label="Por fecha de alta (rango)"
              @select="onCreatedAtFilter"
            />
          </div>
        </div>

        <div class="row q-pa-md">
          <div class="col-12">
            <q-btn @click="resetFilters">Reset all filters</q-btn>
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
            v-if="!props.row.checked"
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-eye-check"
            color="positive"
            @click="updateChecked(props.row.id, true)"
            ><q-tooltip>Comprobar</q-tooltip></q-btn
          >
          <q-btn
            v-if="props.row.checked"
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-eye-remove"
            color="negative"
            @click="updateChecked(props.row.id, false)"
            ><q-tooltip>No comprobar</q-tooltip></q-btn
          >
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
          />
        </span>
        <span v-else-if="props.column.field == 'computer.__str__'">
          <MigasLink
            model="computers"
            :pk="props.row.computer.id"
            :value="props.row.computer.__str__"
            :icon="elementIcon(props.row.computer.status)"
            :tooltip="props.row.computer.summary"
          />
        </span>
        <span v-else-if="props.column.field == 'project.name'">
          <MigasLink
            model="projects"
            :pk="props.row.project.id"
            :value="props.row.project.name || ''"
          />
        </span>
        <span v-else-if="props.column.field == 'created_at'">
          {{ showDate(props.row.created_at) }}
        </span>
        <span v-else-if="props.column.field == 'description'">
          <Truncate v-model="props.row.description" />
        </span>
        <span v-else-if="props.column.field == 'checked'">
          <BooleanView v-model="props.row.checked" />
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
      <div slot="emptystate">{{ $t('vgt.noData') }}</div>
      <div slot="selected-row-actions">
        <q-btn
          class="q-ma-xs"
          size="sm"
          icon="mdi-eye-check"
          color="positive"
          @click="updateItemsChecked(true)"
          ><q-tooltip>Comprobar</q-tooltip></q-btn
        >
        <q-btn
          class="q-ma-xs"
          size="sm"
          icon="mdi-eye-remove"
          color="negative"
          @click="updateItemsChecked(false)"
          ><q-tooltip>No comprobar</q-tooltip></q-btn
        >
        <q-btn
          class="q-ma-xs"
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
import BooleanView from 'components/ui/BooleanView'
import Truncate from 'components/ui/Truncate'
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'
import MigasLink from 'components/MigasLink'
import { dateMixin } from 'mixins/date'
import { elementMixin } from 'mixins/element'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta: {
    title: 'Errors List'
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    BooleanView,
    Truncate,
    SelectTree,
    DateRangeInput,
    MigasLink
  },
  mixins: [dateMixin, elementMixin, datagridMixin],
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
          text: 'Errores',
          icon: 'mdi-bug',
          to: 'errors-dashboard'
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
          label: 'Fecha',
          field: 'created_at'
        },
        {
          field: 'computer.id',
          hidden: true
        },
        {
          field: 'computer.status',
          hidden: true
        },
        {
          field: 'computer.summary',
          hidden: true
        },
        {
          label: 'Ordenador',
          field: 'computer.__str__',
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
          label: 'Comprobado',
          field: 'checked',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.all'),
            trigger: 'enter',
            filterDropdownItems: [
              { value: true, text: 'Sí' },
              { value: false, text: 'No' }
            ]
          }
        },
        {
          label: 'Descripción',
          field: 'description',
          filterOptions: {
            enabled: true,
            placeholder: this.$t('vgt.filter'),
            trigger: 'enter'
          }
        }
      ],
      tableFilters: {
        search: '',
        platform: {
          items: [{ id: '', name: 'Todas' }],
          selected: null
        },
        statusIn: {
          items: [],
          selected: null,
          choices: {}
        },
        createdAt: {
          selected: { from: null, to: null }
        }
      },
      model: 'errors',
      detailRoute: 'error-detail'
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/platforms/')
        .then((response) => {
          this.tableFilters.platform.items = this.tableFilters.platform.items.concat(
            response.data.results
          )

          if (this.$route.query.platform_id) {
            this.tableFilters.platform.selected = this.tableFilters.platform.items.find(
              (x) => x.id == this.$route.query.platform_id
            )
          }
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

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
        .get('/api/v1/token/computers/status/')
        .then((response) => {
          this.updateStatusInFilter(response.data)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>
