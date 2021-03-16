import _merge from 'lodash/merge'

export const datagridMixin = {
  data() {
    const perPage = 10

    return {
      rows: [],
      totalRecords: 0,
      isLoading: false,
      paginationOptions: {
        enabled: true,
        mode: 'records',
        perPage,
        perPageDropdown: [10, 50, 100, 150],
        dropdownAllowAll: false,
        nextLabel: this.$gettext('Next'),
        prevLabel: this.$gettext('Previous'),
        rowsPerPageLabel: this.$gettext('Results per page'),
        ofLabel: this.$gettext('of'),
        pageLabel: this.$gettext('page'), // for 'pages' mode
        allLabel: this.$gettext('All')
      },
      serverParams: {
        columnFilters: {},
        sort: {
          field: '',
          type: ''
        },
        page: 1,
        perPage
      },
      selectOptions: {
        enabled: true,
        selectOnCheckboxOnly: true,
        selectionText: this.$gettext('rows selected'),
        clearSelectionText: this.$gettext('Clear')
      },
      tableFilters: {
        search: ''
      },
      selectedRows: [],
      model: '',
      detailRoute: ''
    }
  },
  computed: {
    searchOptions() {
      return {
        enabled: true,
        skipDiacritics: true,
        externalQuery: this.tableFilters.search
      }
    }
  },
  watch: {
    $route() {
      this.resetFilters(false)
      this.loadQueryParams()
      this.loadItems()
    }
  },
  created() {
    this.loadQueryParams()
  },
  async mounted() {
    await this.loadFilters()
    await this.loadItems()
  },
  methods: {
    loadQueryParams() {
      Object.entries(this.$route.query).map(([key, value]) => {
        let columnKey = null
        let filterKey = null

        if (typeof value === 'boolean') value = value.toString()

        switch (key) {
          case 'capability_id':
            filterKey = 'capability.name'
            break
          case 'connection_id':
            filterKey = 'connection.name'
            break
          case 'device_type_id':
            filterKey = 'device_type.name'
            break
          case 'fault_definition_id':
            filterKey = 'fault_definition.name'
            break
          case 'model_id':
            filterKey = 'model.name'
            break
          case 'package_project_id':
            columnKey = 'package.project.name'
            filterKey = 'package.project.name'
            break
          case 'platform_id':
            columnKey = 'platform'
            filterKey = 'platform.name'
            break
          case 'project_id':
            columnKey = 'project.name'
            filterKey = 'project.name'
            break
          case 'property_id':
            columnKey = 'property_att'
            filterKey = 'property_att'
            break
          case 'schedule_id':
            filterKey = 'schedule.name'
            break
          case 'store_id':
            columnKey = 'store.name'
            filterKey = 'store.name'
            break
        }

        this.updateParams({
          columnFilters: { [columnKey ? columnKey : key]: value }
        })

        let filter = null
        if (key === 'manufacturer_id')
          filter = this.columns.find(
            (x) =>
              x.field === 'manufacturer.name' ||
              x.field === 'model.manufacturer.name'
          )
        else
          filter = this.columns.find(
            (x) => x.field === (filterKey ? filterKey : key)
          )
        if (filter && 'filterOptions' in filter)
          filter.filterOptions.filterValue = value

        filter = null
        if (key in this.tableFilters) {
          switch (key) {
            case 'machine':
              filter = this.findById(this.tableFilters.machine.items, value)
              if (filter) this.tableFilters.machine.selected = filter.label
              break
            case 'schedule':
              filter = this.findById(
                this.tableFilters[key].items,
                value === 'true' ? 1 : value === 'false' ? 0 : ''
              )
              if (filter) this.tableFilters[key].selected = filter.name
              break
            case 'user':
              filter = this.findById(this.tableFilters.user.items, value)
              if (filter) this.tableFilters.user.selected = filter.name
              break
            default:
              this.tableFilters[key] = value
          }
        }

        // special cases
        if ('createdAtRange' in this.tableFilters) {
          if (key === 'created_at__gte')
            this.tableFilters.createdAtRange.selected.from = value

          if (key === 'created_at__lt')
            this.tableFilters.createdAtRange.selected.to = value
        }

        if ('uninstallDate' in this.tableFilters) {
          if (key === 'uninstall_date') {
            filter = this.findById(
              this.tableFilters.uninstallDate.items,
              value === 'true' ? 1 : value === 'false' ? 0 : ''
            )
            if (filter) this.tableFilters.uninstallDate.selected = filter.name
          }
        }
      })
    },

    findById(data, id) {
      return data.reduce((a, item) => {
        if (a) return a
        if (item.id === id) return item
        if (item.children) return this.findById(item.children, id)
      }, null)
    },

    updateParams(newProps) {
      this.serverParams = _merge(this.serverParams, newProps)
      if (!('page' in newProps)) {
        this.$set(this.serverParams, 'page', 1)
        this.$set(this.paginationOptions, 'setCurrentPage', 1)
      }
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

    onCreatedAtRangeFilter(params) {
      this.tableFilters.createdAtRange.selected = params
      this.updateParams({
        columnFilters: Object.assign(this.serverParams.columnFilters, {
          created_at__gte: this.tableFilters.createdAtRange.selected.from,
          created_at__lt: this.tableFilters.createdAtRange.selected.to
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
        const selected = this.findById(
          this.tableFilters.statusIn.items,
          this.$route.query.status_in
        )
        if (selected) this.tableFilters.statusIn.selected = selected.label
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
            case 'application_id':
              ret.application__id = val
              break
            case 'attributes_id':
              ret.attributes__id = val
              break
            case 'attributeset_included_id':
              ret.attributeset_included__id = val
              break
            case 'attributeset_excluded_id':
              ret.attributeset_excluded__id = val
              break
            case 'available_for_attributes_id':
              ret.available_for_attributes__id = val
              break
            case 'available_packages_id':
              ret.available_packages__id = val
              break
            case 'available_package_sets_id':
              ret.available_package_sets__id = val
              break
            case 'capability_id':
            case 'capability.name':
              ret.capability__id = val
              break
            case 'category':
            case 'category.name':
              ret.category = val
              break
            case 'computer.__str__':
              ret.computer__name__icontains = val
              break
            case 'computer_id':
              ret.computer__id = val
              break
            case 'connections_id':
              ret.connections__id = val
              break
            case 'connection.name':
              ret.connection__id = val
              break
            case 'default_logical_device_id':
              ret.default_logical_device__id = val
              break
            case 'deployment':
              ret.deployment__isnull = val
              break
            case 'deployment_id':
              ret.deployment__id = val
              break
            case 'deployment_included_id':
              ret.deployment_included__id = val
              break
            case 'deployment_excluded_id':
              ret.deployment_excluded__id = val
              break
            case 'device_id':
              ret.device__id = val
              break
            case 'device_type_id':
            case 'device_type.name':
              ret.device_type__id = val
              break
            case 'domain_included_id':
              ret.domain_included__id = val
              break
            case 'domain_excluded_id':
              ret.domain_excluded__id = val
              break
            case 'domain_tags_id':
              ret.domain_tags__id = val
              break
            case 'domains_id':
              ret.domains__id = val
              break
            case 'excluded_attributes_id':
              ret.excluded_attributes__id = val
              break
            case 'faultdefinition_id':
              ret.faultdefinition__id = val
              break
            case 'faultdefinition_included_id':
              ret.faultdefinition_included__id = val
              break
            case 'faultdefinition_excluded_id':
              ret.faultdefinition_excluded__id = val
              break
            case 'faultdefinition_users_id':
              ret.faultdefinition_users__id = val
              break
            case 'fault_definition.name':
              ret.fault_definition_id = val
              break
            case 'id_in':
              ret.id__in = val
              break
            case 'included_attributes_id':
              ret.included_attributes__id = val
              break
            case 'level':
            case 'level.name':
              ret.level = val
              break
            case 'logical_id':
              ret.logical__id = val
              break
            case 'manufacturer.name':
              ret.manufacturer__id = val
              break
            case 'model':
              ret.device__model__id = val
              break
            case 'model.manufacturer.name':
              ret.model__manufacturer__id = val
              break
            case 'model_id':
            case 'model.name':
              ret.model__id = val
              break
            case 'package.project.name':
              ret.package__project__id = val
              break
            case 'package_id':
              ret.package__id = val
              break
            case 'packages_id':
              ret.packages__id = val
              break
            case 'packageset_id':
              ret.packageset__id = val
              break
            case 'platform':
              if (this.model === 'computers') ret[key] = val
              else if (this.model === 'projects') ret.platform__id = val
              else ret.project__platform__id = val
              break
            case 'platform.name':
              ret.platform__id = val
              break
            case 'policy_included_id':
              ret.policy_included__id = val
              break
            case 'policy_excluded_id':
              ret.policy_excluded__id = val
              break
            case 'project_id':
            case 'project.name':
              ret.project__id = val
              break
            case 'property_att':
              ret.property_att__id = val
              break
            case 'schedule':
              ret.schedule__isnull = val
              break
            case 'schedule_id':
            case 'schedule.name':
              ret.schedule__id = val
              break
            case 'scope_included_id':
              ret.scope_included__id = val
              break
            case 'scope_excluded_id':
              ret.scope_excluded__id = val
              break
            case 'status':
            case 'status_in':
            case 'status__in':
              if (this.model === 'computers' || this.model === 'status-logs')
                ret.status__in = val
              else ret.computer__status__in = val
              break
            case 'store':
              ret.store__isnull = val
              break
            case 'store.name':
              ret.store__id = val
              break
            case 'sync_attributes_id':
              ret.sync_attributes__id = val
              break
            case 'sync_attributes_id_in':
              ret.sync_attributes__id__in = val
              break
            case 'sync_user_id':
              ret.sync_user__id = val
              break
            case 'tags_id':
              ret.tags__id = val
              break
            case 'uninstall_date':
              ret.uninstall_date__isnull = val
              break
            case 'user_id':
              ret.user__id = val
              break
            case 'users_id':
              ret.users__id = val
              break
            case 'checked':
            case 'user':
            case 'platform_id':
            case 'pms_status_ok':
            case 'created_at__gte':
            case 'created_at__lt':
            case 'start_date__gte':
            case 'start_date__lt':
            case 'install_date__gte':
            case 'install_date__lt':
            case 'uninstall_date__gte':
            case 'uninstall_date__lt':
            case 'auto_register_computers':
            case 'enabled':
            case 'exclusive':
            case 'is_active':
            case 'sort':
            case 'kind':
            case 'architecture':
            case 'machine':
            case 'product_system':
            case 'has_software_inventory':
            case 'installed_package':
            case 'serial':
            case 'sync_end_date__gte':
            case 'sync_end_date__lt':
            case 'percent__gte':
            case 'percent__lt':
            case 'score':
            case 'source':
            case 'search':
              ret[key] = val
              break
            case 'sync_end_date':
              if (val === 0) ret[`${key}__isnull`] = true
              else {
                let d = new Date()
                d = d.toISOString(d.setDate(d.getDate() - val))
                ret[`${key}__lt`] = d
              }
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

    exportData() {
      const items = this.selectedRows.map((item) => item.id)

      if (items.length === 0) return

      this.$axios
        .get(`/api/v1/token/${this.model}/export/?id__in=${items.join(',')}`, {
          responseType: 'blob'
        })
        .then((response) => {
          let fileURL = window.URL.createObjectURL(new Blob([response.data]))
          let fileLink = document.createElement('a')

          fileLink.href = fileURL
          fileLink.setAttribute('download', `${this.model}.csv`)
          document.body.appendChild(fileLink)

          fileLink.click()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    paramsToBackend(obj) {
      const ret = {}
      Object.entries(obj).map(([key, val]) => {
        const lastUnderscore = key.lastIndexOf('_')
        if (lastUnderscore > 0) {
          const newKey = `${key.substring(0, lastUnderscore)}__${key.substring(
            lastUnderscore + 1
          )}`
          ret[newKey] = val
        } else ret[key] = val
      })

      return ret
    },

    exportAll() {
      const params = this.paramsToBackend(this.$route.query)
      Object.assign(params, this.queryParams())
      delete params.page
      delete params.page_size

      this.$axios
        .get(`/api/v1/token/${this.model}/export/`, {
          params,
          responseType: 'blob'
        })
        .then((response) => {
          let fileURL = window.URL.createObjectURL(new Blob([response.data]))
          let fileLink = document.createElement('a')

          fileLink.href = fileURL
          fileLink.setAttribute('download', `${this.model}.csv`)
          document.body.appendChild(fileLink)

          fileLink.click()
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
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

    resetFilters(loadItemsAfter = true) {
      this.$refs.myTable.reset()
      this.resetColumnFilters()

      Object.entries(this.tableFilters).map(([key, value]) => {
        switch (key) {
          case 'createdAtRange':
          case 'installDateRange':
          case 'startDateRange':
          case 'syncEndDateRange':
          case 'uninstallDateRange':
            this.tableFilters[key].selected = { from: null, to: null }
            this.$refs[key].reset()
            break
          case 'serial':
          case 'search':
            this.tableFilters[key] = ''
            break
          case 'machine':
            this.$refs.machineTree.reset()
          case 'statusIn':
            this.$refs.statusTree.reset()
          default:
            this.tableFilters[key].selected = null
        }
      })

      if (loadItemsAfter) this.loadItems()
    }
  }
}
