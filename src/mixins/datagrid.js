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
      selectedRows: []
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
      console.log('serverParams before', this.serverParams)
      this.serverParams = _merge(this.serverParams, newProps)
      console.log('serverParams after', this.serverParams)
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
      console.log(params)
      this.updateParams(params)
      this.loadItems()
    },

    onSelectionChanged(params) {
      this.selectedRows = params.selectedRows
      console.log(this.selectedRows)
    },

    async loadFilters() {},

    async loadItems() {},

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
    }
  }
}
