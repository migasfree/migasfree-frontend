import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref, reactive } from 'vue'
import TableResults from 'src/components/ui/TableResults.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock vue-router
const mockRoute = reactive({
  query: {},
})
const mockRouter = {
  push: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}))

// Mock boot/axios
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: { results: [] } })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({})),
  },
}))

// Mock stores/ui
const mockUiStore = {
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}

vi.mock('stores/ui', () => ({
  useUiStore: () => mockUiStore,
}))

// Mock composables/element
vi.mock('composables/element', () => ({
  appIcon: (name) => `mdi-${name}`,
  modelIcon: (name) => `mdi-model-${name}`,
}))

// Mock composables/dataGrid
const createMockDataGridReturn = () => ({
  tableFilters: reactive({
    search: '',
    platform: { items: [], selected: null },
    project: { items: [], selected: null },
    architecture: { items: [], selected: null },
    softwareInventory: { items: [], selected: null },
    statusIn: { items: [], selected: null },
    machine: { items: [], selected: null },
    user: { items: [], selected: null },
    schedule: { items: [], selected: null },
    model: { items: [], selected: null },
    serial: '',
    mac: '',
    uuid: '',
    startDateRange: { selected: null },
    createdAtRange: { selected: null },
    installDateRange: { selected: null },
    uninstallDateRange: { selected: null },
    uninstallDate: { items: [], selected: null },
    syncEndDate: { items: [], selected: null },
    syncEndDateRange: { selected: null },
  }),
  resetFilters: vi.fn(),
  isLoadingExport: ref(false),
  exportAll: vi.fn(),
  exportData: vi.fn(),
  onSearch: vi.fn(),
  onSearchClear: vi.fn(),
  onCreatedAtRangeFilter: vi.fn(),
  onStartDateRangeFilter: vi.fn(),
  onScheduleFilter: vi.fn(),
  onModelFilter: vi.fn(),
  onStatusInFilter: vi.fn(),
  onPlatformFilter: vi.fn(),
  onProjectFilter: vi.fn(),
  onUserFilter: vi.fn(),
  onInstallDateRangeFilter: vi.fn(),
  onUninstallDateRangeFilter: vi.fn(),
  onUninstallDateFilter: vi.fn(),
  onArchitectureFilter: vi.fn(),
  onMachineFilter: vi.fn(),
  onSoftwareInventoryFilter: vi.fn(),
  onSyncEndDateFilter: vi.fn(),
  onSyncEndDateRangeFilter: vi.fn(),
  onSerialFilter: vi.fn(),
  onMacFilter: vi.fn(),
  onUuidFilter: vi.fn(),
  statusTree: ref(null),
  machineTree: ref(null),
  installDateRange: ref(null),
  uninstallDateRange: ref(null),
  createdAtRange: ref(null),
  startDateRange: ref(null),
  totalRecords: ref(0),
  isLoading: ref(false),
  selectOptions: { enabled: true },
  paginationOptions: {
    enabled: true,
    perPage: 10,
    perPageDropdown: [10, 25, 50, 100],
  },
  searchOptions: { enabled: false },
  onPageChange: vi.fn(),
  onSortChange: vi.fn(),
  onColumnFilter: vi.fn(),
  onPerPageChange: vi.fn(),
  onSelectionChanged: vi.fn(),
  loadItems: vi.fn(),
  rows: ref([]),
  edit: vi.fn(),
  remove: vi.fn(),
  myTable: ref(null),
  confirmRemove: vi.fn(),
  updateChecked: vi.fn(),
  updateEnabled: vi.fn(),
  updateStatusInFilter: vi.fn(),
  updateItemsChecked: vi.fn(),
  updateItemsEnabled: vi.fn(),
})

let mockDataGridReturn = createMockDataGridReturn()

vi.mock('composables/dataGrid', () => ({
  default: () => mockDataGridReturn,
}))

// Mock Quasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    dialog: vi.fn(() => ({ onOk: vi.fn() })),
  }),
}))

describe('TableResults.vue', () => {
  const defaultColumns = [
    { label: 'ID', field: 'id' },
    { label: 'Name', field: 'name' },
  ]

  const defaultProps = {
    title: 'Test Table',
    columns: defaultColumns,
    model: 'test-model',
  }

  const globalStubs = {
    Header: {
      name: 'Header',
      template:
        '<div class="header-stub" :data-title="title" :data-results="results"></div>',
      props: ['title', 'icon', 'results', 'addRoute', 'isLoadingExport'],
    },
    SearchFilter: {
      name: 'SearchFilter',
      template: '<div class="search-filter-stub"></div>',
      props: ['modelValue'],
    },
    BannerInfo: {
      name: 'BannerInfo',
      template: '<div class="banner-info-stub"></div>',
      props: ['message'],
    },
    FilterSelect: {
      name: 'FilterSelect',
      template: '<div class="filter-select-stub"></div>',
      props: ['modelValue', 'options', 'label'],
    },
    SelectTree: {
      name: 'SelectTree',
      template: '<div class="select-tree-stub"></div>',
      props: ['modelValue', 'placeholder', 'prependIcon', 'options'],
    },
    DateRangeInput: {
      name: 'DateRangeInput',
      template: '<div class="date-range-input-stub"></div>',
      props: ['modelValue', 'prependIcon', 'label'],
    },
    TablePagination: {
      name: 'TablePagination',
      template: '<div class="table-pagination-stub"></div>',
      props: ['total', 'pageChanged', 'perPageChanged', 'paginationOptions'],
    },
    'vue-good-table': {
      name: 'vue-good-table',
      template: '<div class="vue-good-table-stub"></div>',
      props: [
        'columns',
        'rows',
        'mode',
        'totalRows',
        'isLoading',
        'selectOptions',
        'paginationOptions',
        'searchOptions',
        'compactMode',
        'lineNumbers',
        'styleClass',
      ],
    },
    'q-list': {
      name: 'q-list',
      template: '<div class="q-list"><slot /></div>',
    },
    'q-expansion-item': {
      name: 'q-expansion-item',
      template: '<div class="q-expansion-item"><slot /></div>',
      props: ['icon', 'label'],
    },
    'q-input': {
      name: 'q-input',
      template: '<input class="q-input" />',
      props: ['modelValue', 'label', 'outlined', 'dense', 'clearable'],
    },
    'q-btn': {
      name: 'q-btn',
      template: '<button class="q-btn"></button>',
      props: [
        'icon',
        'color',
        'textColor',
        'label',
        'round',
        'size',
        'loading',
      ],
    },
    'q-icon': {
      name: 'q-icon',
      template: '<i class="q-icon"></i>',
      props: ['name'],
    },
    'q-spinner': {
      name: 'q-spinner',
      template: '<div class="q-spinner"></div>',
    },
    'q-tooltip': true,
  }

  const createWrapper = (props = {}) => {
    return shallowMount(TableResults, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: globalStubs,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDataGridReturn = createMockDataGridReturn()
  })

  describe('basic rendering', () => {
    it('renders with required props', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders Header component with correct title', () => {
      const wrapper = createWrapper({ title: 'My Custom Title' })
      const header = wrapper.findComponent({ name: 'Header' })
      expect(header.exists()).toBe(true)
      expect(header.props('title')).toBe('My Custom Title')
    })

    it('renders SearchFilter component', () => {
      const wrapper = createWrapper()
      expect(wrapper.findComponent({ name: 'SearchFilter' }).exists()).toBe(
        true,
      )
    })

    it('renders vue-good-table component', () => {
      const wrapper = createWrapper()
      expect(wrapper.findComponent({ name: 'vue-good-table' }).exists()).toBe(
        true,
      )
    })
  })

  describe('more filters panel', () => {
    it('renders expansion panel when moreFilters has items', () => {
      const wrapper = createWrapper({
        moreFilters: ['platform', 'project'],
      })
      expect(wrapper.findComponent({ name: 'q-list' }).exists()).toBe(true)
    })

    it('does not render q-list when moreFilters is empty', () => {
      const wrapper = createWrapper({
        moreFilters: [],
      })
      expect(wrapper.findComponent({ name: 'q-list' }).exists()).toBe(false)
    })
  })

  describe('action buttons visibility', () => {
    it('hasDeleteAction returns true for syncs model', () => {
      const wrapper = createWrapper({ model: 'syncs' })
      expect(wrapper.vm.hasDeleteAction).toBe(true)
    })

    it('hasDeleteAction returns true for messages model', () => {
      const wrapper = createWrapper({ model: 'messages' })
      expect(wrapper.vm.hasDeleteAction).toBe(true)
    })

    it('hasDeleteAction returns true for status-logs model', () => {
      const wrapper = createWrapper({ model: 'status-logs' })
      expect(wrapper.vm.hasDeleteAction).toBe(true)
    })

    it('hasDeleteAction returns true for migrations model', () => {
      const wrapper = createWrapper({ model: 'migrations' })
      expect(wrapper.vm.hasDeleteAction).toBe(true)
    })

    it('hasDeleteAction returns true for notifications model', () => {
      const wrapper = createWrapper({ model: 'notifications' })
      expect(wrapper.vm.hasDeleteAction).toBe(true)
    })

    it('hasCheckActions returns true for errors model', () => {
      const wrapper = createWrapper({ model: 'errors' })
      expect(wrapper.vm.hasCheckActions).toBe(true)
    })

    it('hasCheckActions returns true for faults model', () => {
      const wrapper = createWrapper({ model: 'faults' })
      expect(wrapper.vm.hasCheckActions).toBe(true)
    })

    it('hasCheckActions returns true for notifications model', () => {
      const wrapper = createWrapper({ model: 'notifications' })
      expect(wrapper.vm.hasCheckActions).toBe(true)
    })

    it('hasCheckActions returns false for computers model', () => {
      const wrapper = createWrapper({ model: 'computers' })
      expect(wrapper.vm.hasCheckActions).toBe(false)
    })

    it('hasEnableActions returns true for formulas model', () => {
      const wrapper = createWrapper({ model: 'formulas' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for deployments model', () => {
      const wrapper = createWrapper({ model: 'deployments' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for singularities model', () => {
      const wrapper = createWrapper({ model: 'singularities' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for stamps model', () => {
      const wrapper = createWrapper({ model: 'stamps' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for attribute-sets model', () => {
      const wrapper = createWrapper({ model: 'attribute-sets' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for fault-definitions model', () => {
      const wrapper = createWrapper({ model: 'fault-definitions' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for user-profiles model', () => {
      const wrapper = createWrapper({ model: 'user-profiles' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns true for catalog/policies model', () => {
      const wrapper = createWrapper({ model: 'catalog/policies' })
      expect(wrapper.vm.hasEnableActions).toBe(true)
    })

    it('hasEnableActions returns false for computers model', () => {
      const wrapper = createWrapper({ model: 'computers' })
      expect(wrapper.vm.hasEnableActions).toBe(false)
    })
  })

  describe('routes', () => {
    it('detailRoute returns route when provided', () => {
      const wrapper = createWrapper({
        routes: { detail: 'item-detail' },
      })
      expect(wrapper.vm.detailRoute).toBe('item-detail')
    })

    it('detailRoute returns null when not provided', () => {
      const wrapper = createWrapper({
        routes: {},
      })
      expect(wrapper.vm.detailRoute).toBeNull()
    })

    it('addRoute returns route when provided', () => {
      const wrapper = createWrapper({
        routes: { add: 'item-add' },
      })
      expect(wrapper.vm.addRoute).toBe('item-add')
    })

    it('addRoute returns null when not provided', () => {
      const wrapper = createWrapper({
        routes: {},
      })
      expect(wrapper.vm.addRoute).toBeNull()
    })

    it('hasDeleteAction is truthy when detailRoute is provided', () => {
      const wrapper = createWrapper({
        routes: { detail: 'item-detail' },
      })
      expect(wrapper.vm.hasDeleteAction).toBeTruthy()
    })
  })

  describe('filter methods', () => {
    it('exposes onSearch method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.onSearch).toBe('function')
    })

    it('exposes onSearchClear method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.onSearchClear).toBe('function')
    })

    it('exposes resetFilters method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.resetFilters).toBe('function')
    })

    it('exposes loadItems method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.loadItems).toBe('function')
    })
  })

  describe('title icon', () => {
    it('sets titleIcon based on model', () => {
      const wrapper = createWrapper({ model: 'computers' })
      expect(wrapper.vm.titleIcon).toBe('mdi-model-computers')
    })
  })

  describe('table props', () => {
    it('passes columns to vue-good-table', () => {
      const customColumns = [{ label: 'Custom', field: 'custom' }]
      const wrapper = createWrapper({ columns: customColumns })
      const table = wrapper.findComponent({ name: 'vue-good-table' })
      expect(table.props('columns')).toEqual(customColumns)
    })

    it('passes mode="remote" to vue-good-table', () => {
      const wrapper = createWrapper()
      const table = wrapper.findComponent({ name: 'vue-good-table' })
      expect(table.props('mode')).toBe('remote')
    })
  })

  describe('export functionality', () => {
    it('exposes exportAll method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.exportAll).toBe('function')
    })

    it('exposes exportData method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.exportData).toBe('function')
    })
  })

  describe('selection and actions', () => {
    it('exposes onSelectionChanged method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.onSelectionChanged).toBe('function')
    })

    it('exposes updateChecked method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.updateChecked).toBe('function')
    })

    it('exposes updateEnabled method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.updateEnabled).toBe('function')
    })

    it('exposes confirmRemove method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.confirmRemove).toBe('function')
    })

    it('exposes edit method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.edit).toBe('function')
    })
  })
})
