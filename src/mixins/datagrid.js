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
        nextLabel: this.$gettext('Next'),
        prevLabel: this.$gettext('Previous'),
        rowsPerPageLabel: this.$gettext('Results per page'),
        ofLabel: this.$gettext('of'),
        pageLabel: this.$gettext('page'), // for 'pages' mode
        allLabel: this.$gettext('All')
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
  created() {
    if (this.$route.query.property_id) {
      this.updateParams({
        columnFilters: { property_att: this.$route.query.property_id }
      })
      this.columns.find(
        (x) => x.field === 'property_att'
      ).filterOptions.filterValue = this.$route.query.property_id
    }

    if (this.$route.query.search) {
      this.updateParams({
        columnFilters: { search: this.$route.query.search }
      })
      this.tableFilters.search = this.$route.query.search
    }

    if (this.$route.query.computer_id) {
      this.updateParams({
        columnFilters: { computer_id: this.$route.query.computer_id }
      })
    }

    if (this.$route.query.platform_id) {
      this.updateParams({
        columnFilters: { platform: this.$route.query.platform_id }
      })
    }

    if (this.$route.query.project_id) {
      this.updateParams({
        columnFilters: { 'project.name': this.$route.query.project_id }
      })
      this.columns.find(
        (x) => x.field === 'project.name'
      ).filterOptions.filterValue = this.$route.query.project_id
    }

    if ('checked' in this.$route.query) {
      this.updateParams({
        columnFilters: { checked: this.$route.query.checked }
      })
      this.columns.find(
        (x) => x.field === 'checked'
      ).filterOptions.filterValue = this.$route.query.checked
    }

    if (this.$route.query.status_in) {
      this.updateParams({
        columnFilters: { status_in: this.$route.query.status_in }
      })
    }

    if (this.$route.query.created_at__gte && this.$route.query.created_at__lt) {
      this.updateParams({
        columnFilters: {
          created_at__gte: this.$route.query.created_at__gte,
          created_at__lt: this.$route.query.created_at__lt
        }
      })
      this.tableFilters.createdAt.selected = {
        from: this.$route.query.created_at__gte,
        to: this.$route.query.created_at__lt
      }
    }

    if (this.$route.query.name) {
      this.updateParams({ columnFilters: { name: this.$route.query.name } })
      this.columns.find(
        (x) => x.field === 'name'
      ).filterOptions.filterValue = this.$route.query.name
    }

    if (this.$route.query.machine) {
      this.updateParams({
        columnFilters: { machine: this.$route.query.machine }
      })
      this.tableFilters.machine.selected = this.findById(
        this.tableFilters.machine.items,
        this.$route.query.machine
      ).label
    }

    if (this.$route.query.fault_definition_id) {
      this.updateParams({
        columnFilters: {
          fault_definition_id: this.$route.query.fault_definition_id
        }
      })
      this.columns.find(
        (x) => x.field === 'fault_definition.name'
      ).filterOptions.filterValue = this.$route.query.fault_definition_id
    }

    if ('pms_status_ok' in this.$route.query) {
      this.updateParams({
        columnFilters: { pms_status_ok: this.$route.query.pms_status_ok }
      })
      this.columns.find(
        (x) => x.field === 'pms_status_ok'
      ).filterOptions.filterValue = this.$route.query.pms_status_ok
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

    onPlatformFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          platform: params.id
        })
      })
      this.loadItems()
    },

    onCreatedAtFilter(params) {
      this.tableFilters.createdAt.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          created_at__gte: this.tableFilters.createdAt.selected.from,
          created_at__lt: this.tableFilters.createdAt.selected.to
        })
      })
      this.loadItems()
    },

    onStatusInFilter(params) {
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          status_in: params.id
        })
      })
      this.loadItems()
    },

    updateStatusInFilter(options) {
      this.tableFilters.statusIn.choices = options.choices

      this.tableFilters.statusIn.items = [
        { id: '', label: this.$gettext('All') },
        {
          id: options.subscribed.join(','),
          label: this.$gettext('subscribed'),
          children: [
            {
              id: options.productive.join(','),
              label: this.$gettext('productive'),
              children: Object.entries(options.productive).map(([key, val]) => {
                return { id: val, label: options.choices[val] }
              })
            },
            {
              id: options.unproductive.join(','),
              label: this.$gettext('unproductive'),
              children: Object.entries(options.unproductive).map(
                ([key, val]) => {
                  return { id: val, label: options.choices[val] }
                }
              )
            }
          ]
        },
        {
          id: options.unsubscribed.join(','),
          label: this.$gettext('unsubscribed')
        }
      ]

      if (this.$route.query.status_in) {
        this.tableFilters.statusIn.selected = this.findById(
          this.tableFilters.statusIn.items,
          this.$route.query.status_in
        ).label
      }
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
            case 'platform.name':
              ret.platform__id = val
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
            case 'auto_register_computers':
            case 'enabled':
            case 'sort':
            case 'kind':
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
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Item deleted!')
          )
          if (reload) this.loadItems()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    confirmRemove(id) {
      let items = []
      let message = this.$gettext('Are you sure you want to remove this item?')

      if (typeof id === 'number' && id > 0) {
        items.push(id)
      } else {
        message = this.$gettext(
          'Are you sure you want to remove all these items?'
        )
        items = this.selectedRows.map((item) => item.id)
      }

      if (items.length === 0) return

      this.$q
        .dialog({
          message,
          ok: {
            color: 'negative',
            label: this.$gettext('Delete'),
            icon: 'mdi-delete'
          },
          cancel: {
            flat: true,
            label: this.$gettext('Cancel')
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
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Changed item check value!')
          )
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
    },

    resetFilters() {
      this.tableFilters.search = ''
      this.$refs.myTable.reset()
      this.resetColumnFilters()

      if ('platform' in this.tableFilters)
        this.tableFilters.platform.selected = null

      if ('architecture' in this.tableFilters)
        this.tableFilters.architecture.selected = null

      if ('softwareInventory' in this.tableFilters)
        this.tableFilters.softwareInventory.selected = null

      if ('syncEndDate' in this.tableFilters)
        this.tableFilters.syncEndDate.selected = null

      if ('user' in this.tableFilters) this.tableFilters.user.selected = null

      if ('statusIn' in this.tableFilters) {
        this.tableFilters.statusIn.selected = null
        this.$refs.statusTree.reset()
      }

      if ('createdAt' in this.tableFilters) {
        this.tableFilters.createdAt.selected = { from: null, to: null }
        this.$refs.createdAtRange.reset()
      }

      if ('syncEndDateRange' in this.tableFilters) {
        this.tableFilters.syncEndDateRange.selected = { from: null, to: null }
        this.$refs.syncEndDateRange.reset()
      }

      if ('startDate' in this.tableFilters) {
        this.tableFilters.startDate.selected = { from: null, to: null }
        this.$refs.startDateRange.reset()
      }

      if ('machine' in this.tableFilters) {
        this.tableFilters.machine.selected = null
        this.$refs.machineTree.reset()
      }

      this.loadItems()
    }
  }
}
