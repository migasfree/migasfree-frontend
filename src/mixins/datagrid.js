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
    updateParams(newProps) {
      console.log('serverParams before', this.serverParams)
      this.serverParams = Object.assign({}, this.serverParams, newProps)
      console.log('serverParams after', this.serverParams)
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

    async loadItems() {}
  }
}
