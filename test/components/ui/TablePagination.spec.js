import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import TablePagination from 'src/components/ui/TablePagination.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock stores/ui
const mockCurrentPageTable = ref(1)
vi.mock('stores/ui', () => ({
  useUiStore: () => ({
    currentPageTable: mockCurrentPageTable,
  }),
}))

// Mock config/app.conf
vi.mock('config/app.conf', () => ({
  RESULTS_PER_PAGE: 10,
  MAX_RESULTS_PER_PAGE: 200,
}))

describe('TablePagination.vue', () => {
  const defaultProps = {
    total: 100,
    pageChanged: vi.fn(),
    perPageChanged: vi.fn(),
    paginationOptions: {
      perPageDropdown: [10, 25, 50, 100],
    },
  }

  const createWrapper = (props = {}) => {
    return mount(TablePagination, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        mocks: {
          ...mockGettext,
          $q: { screen: { gt: { xs: true } } },
        },
        stubs: {
          'q-toolbar': {
            template: '<div class="q-toolbar"><slot /></div>',
          },
          'q-toolbar-title': {
            template: '<div class="q-toolbar-title"><slot /></div>',
          },
          'q-btn': {
            template:
              '<button class="q-btn" :data-icon="icon" @click="$emit(\'click\')"><slot /></button>',
            props: ['icon', 'color'],
          },
          'q-btn-dropdown': {
            template: '<div class="q-btn-dropdown"><slot /></div>',
            props: ['label'],
          },
          'q-list': {
            template: '<div class="q-list"><slot /></div>',
          },
          'q-item': {
            template:
              '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
          },
          'q-item-section': {
            template: '<div class="q-item-section"><slot /></div>',
          },
          'q-item-label': {
            template: '<span class="q-item-label"><slot /></span>',
          },
          'q-space': {
            template: '<div class="q-space"></div>',
          },
          'q-pagination': {
            template:
              '<div class="q-pagination" :data-max="max"><slot /></div>',
            props: [
              'modelValue',
              'max',
              'input',
              'inputClass',
              'size',
              'directionLinks',
              'boundaryLinks',
              'iconFirst',
              'iconLast',
            ],
          },
          'q-tooltip': true,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentPageTable.value = 1
  })

  describe('rendering', () => {
    it('renders pagination when total > perPage', () => {
      const wrapper = createWrapper({ total: 100 })
      expect(wrapper.find('.pagination-container').exists()).toBe(true)
    })

    it('does not render pagination when total <= perPage', () => {
      const wrapper = createWrapper({ total: 5 })
      expect(wrapper.find('.pagination-container').exists()).toBe(false)
    })

    it('renders "View All" button when total <= MAX_RESULTS_PER_PAGE', () => {
      const wrapper = createWrapper({ total: 150 })
      const buttons = wrapper.findAll('.q-btn')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('does not render "View All" button when total > MAX_RESULTS_PER_PAGE', () => {
      const wrapper = createWrapper({ total: 500 })
      // The view all button should not be present
      expect(wrapper.vm.showAllOption).toBe(false)
    })

    it('renders per-page dropdown when enabled', () => {
      const wrapper = createWrapper({ perPageDropdownEnabled: true })
      expect(wrapper.find('.q-btn-dropdown').exists()).toBe(true)
    })

    it('does not render per-page dropdown when disabled', () => {
      const wrapper = createWrapper({ perPageDropdownEnabled: false })
      expect(wrapper.find('.q-btn-dropdown').exists()).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('calculates pagesCount correctly (exact division)', () => {
      const wrapper = createWrapper({ total: 100 })
      // 100 / 10 = 10 pages
      expect(wrapper.vm.pagesCount).toBe(10)
    })

    it('calculates pagesCount correctly (with remainder)', () => {
      const wrapper = createWrapper({ total: 95 })
      // 95 / 10 = 9.5 -> 10 pages
      expect(wrapper.vm.pagesCount).toBe(10)
    })

    it('formats recordInfo correctly', () => {
      const wrapper = createWrapper({ total: 100 })
      // Page 1: "1 - 10 / 100"
      expect(wrapper.vm.recordInfoNumbers).toBe('1 - 10')
    })

    it('formats recordInfo correctly for last page', () => {
      const wrapper = createWrapper({ total: 95 })
      wrapper.vm.currentPage = 10
      // Page 10: "91 - 95 / 95"
      expect(wrapper.vm.recordInfoNumbers).toBe('91 - 95')
    })

    it('formats perPageLabel correctly', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.perPageLabel).toBe('Results: 10')
    })

    it('showPagination returns true when total > currentPerPage', () => {
      const wrapper = createWrapper({ total: 100 })
      expect(wrapper.vm.showPagination).toBe(true)
    })

    it('showPagination returns false when total <= currentPerPage', () => {
      const wrapper = createWrapper({ total: 5 })
      expect(wrapper.vm.showPagination).toBe(false)
    })

    it('showAllOption returns true when total <= MAX_RESULTS_PER_PAGE', () => {
      const wrapper = createWrapper({ total: 150 })
      expect(wrapper.vm.showAllOption).toBe(true)
    })

    it('showAllOption returns false when total > MAX_RESULTS_PER_PAGE', () => {
      const wrapper = createWrapper({ total: 500 })
      expect(wrapper.vm.showAllOption).toBe(false)
    })

    it('showAllOption returns false when total is 0', () => {
      const wrapper = createWrapper({ total: 0 })
      expect(wrapper.vm.showAllOption).toBe(false)
    })
  })

  describe('user interactions', () => {
    it('customPageChange calls pageChanged prop', () => {
      const pageChanged = vi.fn()
      const wrapper = createWrapper({ pageChanged })

      wrapper.vm.customPageChange(5)

      expect(pageChanged).toHaveBeenCalledWith({ currentPage: 5 })
    })

    it('customPageChange uses currentPage when no argument provided', () => {
      const pageChanged = vi.fn()
      const wrapper = createWrapper({ pageChanged })
      wrapper.vm.currentPage = 3

      wrapper.vm.customPageChange()

      expect(pageChanged).toHaveBeenCalledWith({ currentPage: 3 })
    })

    it('customPerPageChange calls perPageChanged and updates state', () => {
      const perPageChanged = vi.fn()
      const wrapper = createWrapper({ perPageChanged, total: 100 })

      wrapper.vm.customPerPageChange(25)

      expect(perPageChanged).toHaveBeenCalledWith({ currentPerPage: 25 })
      expect(wrapper.vm.currentPerPage).toBe(25)
    })

    it('customPerPageChange resets page to 1 when viewing all', () => {
      const perPageChanged = vi.fn()
      const wrapper = createWrapper({ perPageChanged, total: 100 })
      wrapper.vm.currentPage = 5

      wrapper.vm.customPerPageChange(100) // equals total

      expect(wrapper.vm.currentPage).toBe(1)
    })

    it('watches currentPageTable and updates currentPage', async () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.currentPage).toBe(1)

      mockCurrentPageTable.value = 5
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentPage).toBe(5)
    })
  })

  describe('rowsPerPageOptions', () => {
    it('returns perPageDropdown from paginationOptions', () => {
      const wrapper = createWrapper({
        paginationOptions: {
          perPageDropdown: [5, 10, 20],
        },
      })

      expect(wrapper.vm.rowsPerPageOptions).toEqual([5, 10, 20])
    })
  })
})
