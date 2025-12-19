import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StackedBar from 'src/components/chart/StackedBar.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock composables
vi.mock('composables/element', () => ({
  appIcon: (name) => `mdi-${name}`,
}))

vi.mock('composables/chart/export', () => ({
  useChartExport: () => ({
    saveSvgImage: vi.fn(),
    savePngImage: vi.fn(),
    wrapCsvValue: (val) => `"${val}"`,
  }),
}))

vi.mock('composables/chart/options', () => ({
  useChartOptions: () => ({
    initOptions: { renderer: 'svg' },
    loadingOptions: {},
    getChartColors: () => ['#5470c6', '#91cc75'],
    getTextColor: () => '#333',
  }),
}))

vi.mock('composables/chart/utils', () => ({
  useChartUtils: vi.fn(),
}))

// Mock boot/axios
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { x_labels: [], data: {} } }),
  },
}))

// Mock stores
vi.mock('stores/ui', () => ({
  useUiStore: () => ({
    notifyError: vi.fn(),
  }),
}))

// Mock Quasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: { isActive: false },
  }),
  exportFile: vi.fn(() => true),
}))

describe('StackedBar.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(StackedBar, {
      props: {
        title: 'Test Chart',
        ...props,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-card': {
            template: '<div class="q-card"><slot /></div>',
            props: ['bordered', 'flat'],
          },
          'q-card-section': {
            template: '<div class="q-card-section"><slot /></div>',
          },
          'q-card-actions': {
            template: '<div class="q-card-actions"><slot /></div>',
          },
          'q-btn': {
            template:
              '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
            props: ['icon', 'flat', 'color', 'loading', 'disabled', 'label'],
          },
          'q-btn-toggle': {
            template: '<div class="q-btn-toggle"><slot /></div>',
            props: ['modelValue', 'options', 'flat'],
          },
          'q-btn-dropdown': {
            template:
              '<div class="q-btn-dropdown"><slot name="label" /><slot /></div>',
          },
          'q-tooltip': true,
          'q-icon': {
            template: '<i class="q-icon"></i>',
            props: ['name', 'size'],
          },
          'q-dialog': {
            template: '<div class="q-dialog" v-if="modelValue"><slot /></div>',
            props: ['modelValue'],
          },
          'q-table': {
            template: '<table class="q-table"><slot /></table>',
          },
          'q-list': {
            template: '<div class="q-list"><slot /></div>',
          },
          'q-item': {
            template:
              '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
          },
          'v-chart': {
            template: '<div class="v-chart"></div>',
            props: [
              'initOptions',
              'option',
              'loading',
              'loadingOptions',
              'autoresize',
            ],
          },
          BannerInfo: {
            template: '<div class="banner-info">{{ message }}</div>',
            props: ['message'],
          },
          MonthInput: {
            template: '<input class="month-input" />',
            props: ['modelValue', 'label'],
          },
          DayInput: {
            template: '<input class="day-input" />',
            props: ['modelValue', 'label'],
          },
          'q-th': {
            template: '<th class="q-th"><slot /></th>',
          },
          'q-tr': {
            template: '<tr class="q-tr"><slot /></tr>',
          },
          'q-td': {
            template: '<td class="q-td"><slot /></td>',
          },
        },
        directives: {
          'close-popup': {},
        },
      },
    })
  }

  it('renders correctly with title', () => {
    const wrapper = createWrapper({ title: 'My Chart', showTitle: true })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('My Chart')
  })

  it('hides title when showTitle is false', () => {
    const wrapper = createWrapper({ title: 'Hidden Title', showTitle: false })
    expect(wrapper.text()).not.toContain('Hidden Title')
  })

  it('shows month selector when monthSelector is true', () => {
    const wrapper = createWrapper({ title: 'Test', monthSelector: true })
    expect(wrapper.findAll('.month-input').length).toBe(2)
  })

  it('shows day selector when daySelector is true', () => {
    const wrapper = createWrapper({ title: 'Test', daySelector: true })
    expect(wrapper.findAll('.day-input').length).toBe(2)
  })

  it('does not show selectors by default', () => {
    const wrapper = createWrapper({ title: 'Test' })
    expect(wrapper.find('.month-input').exists()).toBe(false)
    expect(wrapper.find('.day-input').exists()).toBe(false)
  })

  it('has borderless option', () => {
    const wrapper = createWrapper({ title: 'Test', borderless: true })
    expect(wrapper.exists()).toBe(true)
  })

  it('isChartVisible is false when no data', () => {
    const wrapper = createWrapper({ title: 'Test' })
    expect(wrapper.vm.isChartVisible).toBe(false)
  })

  it('noData is true when no series', () => {
    const wrapper = createWrapper({ title: 'Test' })
    expect(wrapper.vm.noData).toBe(true)
  })

  it('shows banner when noData and not loading', () => {
    const wrapper = createWrapper({ title: 'Test' })
    expect(wrapper.find('.banner-info').exists()).toBe(true)
  })

  it('emits get-link on passData', () => {
    const wrapper = createWrapper({ title: 'Test' })
    wrapper.vm.passData({ data: { id: 1 } })
    expect(wrapper.emitted('get-link')).toBeTruthy()
    expect(wrapper.emitted('get-link')[0]).toEqual([{ data: { id: 1 } }])
  })

  it('selectCell calls passData', () => {
    const wrapper = createWrapper({ title: 'Test' })
    const mockData = { id: 1, value: 10 }
    wrapper.vm.selectCell(mockData)
    expect(wrapper.emitted('get-link')).toBeTruthy()
  })

  it('dataView opens dialog', () => {
    const wrapper = createWrapper({ title: 'Test' })
    wrapper.vm.dataView()
    expect(wrapper.vm.viewData).toBe(true)
  })

  it('default selectedMode is multiple', () => {
    const wrapper = createWrapper({ title: 'Test' })
    expect(wrapper.vm.selectedMode).toBe('multiple')
  })

  it('accepts initialData prop', () => {
    const initialData = {
      xData: ['Jan', 'Feb'],
      series: [{ name: 'A', data: [1, 2] }],
    }
    const wrapper = createWrapper({ title: 'Test', initialData })
    expect(wrapper.vm.data).toEqual(initialData)
  })
})
