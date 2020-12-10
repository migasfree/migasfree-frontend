import _merge from 'lodash/merge'

export const datagridMixin = {
  data() {
    return {
      rows: [],
      totalRecords: 0,
      isLoading: false,
      serverParams: {
        columnFilters: {},
        sort: {
          field: '',
          type: ''
        },
        page: 1,
        perPage: 100
      },
      selectOptions: { enabled: true, selectOnCheckboxOnly: true },
      tableFilters: {
        search: ''
      },
      selectedRows: [],
      model: '',
      detailRoute: ''
    }
  },
  computed: {
    paginationOptions() {
      return {
        enabled: true,
        mode: 'records',
        perPage: this.serverParams.perPage,
        perPageDropdown: [50, 100, 150],
        dropdownAllowAll: false,
        nextLabel: this.$t('vgt.next'),
        prevLabel: this.$t('vgt.prev'),
        rowsPerPageLabel: this.$t('vgt.rowPerPage'),
        ofLabel: this.$t('vgt.of'),
        pageLabel: this.$t('vgt.page'), // for 'pages' mode
        allLabel: this.$t('vgt.all')
      }
    },

    searchOptions() {
      return {
        enabled: true,
        skipDiacritics: true,
        externalQuery: this.tableFilters.search
      }
    }
  },
  async mounted() {
    await this.loadFilters()
    await this.loadItems()
  },
  methods: {
    findById(data, id) {
      for (var i = 0; i < data.length; i++) {
        console.log(data[i].id, id, data[i].id == id)
        if (data[i].id == id) {
          return data[i]
        } else if (
          data[i].children &&
          data[i].children.length &&
          typeof data[i].children === 'object'
        ) {
          return this.findById(data[i].children, id)
        }
      }
    },

    updateParams(newProps) {
      this.serverParams = _merge(this.serverParams, newProps)
    },

    resetColumnFilters() {
      this.serverParams.columnFilters = {}
    },

    onPageChange(params) {
      this.updateParams({ page: params.currentPage })
      this.loadItems()
    },

    onPerPageChange(params) {
      this.updateParams({ perPage: params.currentPerPage })
      this.loadItems()
    },

    onSortChange(params) {
      this.updateParams({
        sort: {
          type: params[0].type === 'desc' ? '-' : '',
          field: params[0].field.split('.')[0]
        }
      })
      this.loadItems()
    },

    onColumnFilter(params) {
      this.updateParams(params)
      this.loadItems()
    },

    onSelectionChanged(params) {
      this.selectedRows = params.selectedRows
    },

    onSearch(value) {
      this.tableFilters.search = value
      this.updateParams({
        columnFilters: { search: this.tableFilters.search }
      })
      this.loadItems()
    },

    onSearchClear() {
      this.onSearch('')
    },

    queryParams() {
      let ret = {
        page_size: this.serverParams.perPage,
        page: this.serverParams.page
      }

      if (this.serverParams.sort.field) {
        ret.ordering = `${this.serverParams.sort.type}${this.serverParams.sort.field}`
      }

      if (Object.keys(this.serverParams.columnFilters).length) {
        Object.entries(this.serverParams.columnFilters).map(([key, val]) => {
          switch (key) {
            case 'computer.__str__':
              ret.computer__name__icontains = val
              break
            case 'computer_id':
              ret.computer__id = val
              break
            case 'fault_definition.name':
              ret.fault_definition_id = val
              break
            case 'platform':
              ret.project__platform__id = val
              break
            case 'project_id':
            case 'project.name':
              ret.project__id = val
              break
            case 'property_att':
              ret.property_att__id = val
              break
            case 'status_in':
              ret.computer__status__in = val
              break
            case 'store.name':
              ret.store__id = val
              break
            case 'checked':
            case 'user':
            case 'platform_id':
            case 'pms_status_ok':
            case 'created_at__gte':
            case 'created_at__lt':
            case 'start_date__gte':
            case 'start_date__lt':
            case 'search':
              ret[key] = val
              break
            default:
              ret[`${key.replace('.', '__')}__icontains`] = val
          }
        })
      }

      return ret
    },

    async loadFilters() {},

    async loadItems() {
      if (this.isLoading) return

      this.isLoading = true
      await this.$axios
        .get(`/api/v1/token/${this.model}/`, { params: this.queryParams() })
        .then((response) => {
          this.totalRecords = response.data.count
          this.rows = response.data.results
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.isLoading = false))
    },

    edit(id) {
      this.$router.push({ name: this.detailRoute, params: { id } })
    },

    remove(id, reload = true) {
      this.$axios
        .delete(`/api/v1/token/${this.model}/${id}/`)
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Item deleted!')
          if (reload) this.loadItems()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    confirmRemove(id) {
      let items = []
      let message = 'Are you sure you want to remove this item?'

      if (typeof id === 'number' && id > 0) {
        items.push(id)
      } else {
        message = 'Are you sure you want to remove all these items?'
        items = this.selectedRows.map((item) => item.id)
      }

      if (items.length === 0) return

      this.$q
        .dialog({
          message,
          ok: {
            color: 'negative',
            label: 'Borrar',
            icon: 'mdi-delete'
          },
          cancel: {
            flat: true
          },
          persistent: true
        })
        .onOk(() => {
          items.forEach((id) => {
            this.remove(id, items[items.length - 1] === id)
          })
        })
    },

    updateChecked(id, value, reload = true) {
      this.$axios
        .patch(`/api/v1/token/${this.model}/${id}/`, { checked: value })
        .then((response) => {
          this.$store.dispatch('ui/notifySuccess', 'Changed item check value!')
          if (reload) this.loadItems()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    updateItemsChecked(value) {
      const items = this.selectedRows.map((item) => item.id)
      if (items.length === 0) return

      items.forEach((id) => {
        this.updateChecked(id, value, items[items.length - 1] === id)
      })
    }
  }
}
