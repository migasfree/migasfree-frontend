import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Pie from 'src/components/chart/Pie.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock dependencies
const mocks = vi.hoisted(() => ({
  router: { push: vi.fn() },
  api: { get: vi.fn() },
  chartOptions: {
    initOptions: { some: 'option' },
    loadingOptions: { text: 'Loading...' },
    getChartColors: vi.fn(() => ['#ffffff']),
    getTextColor: vi.fn(() => '#000000'),
  },
  chartUtils: { groupBy: vi.fn() },
  chartExport: {
    saveSvgImage: vi.fn(),
    savePngImage: vi.fn(),
    exportTableToCsv: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => mocks.router,
}))

vi.mock('boot/axios', () => ({
  api: mocks.api,
}))

vi.mock('composables/element', () => ({
  appIcon: () => 'icon-app',
}))

vi.mock('components/ui/BannerInfo', () => ({
  default: { name: 'BannerInfo', template: '<div>BannerInfo</div>' },
}))

// Mock composables
vi.mock('composables/chart/options', () => ({
  useChartOptions: () => mocks.chartOptions,
}))

vi.mock('composables/chart/utils', () => ({
  useChartUtils: () => mocks.chartUtils,
}))

vi.mock('composables/chart/export', () => ({
  useChartExport: () => mocks.chartExport,
}))

// Mock echarts
vi.mock('echarts/core', () => ({
  use: vi.fn(),
}))
vi.mock('echarts/charts', () => ({
  PieChart: {},
}))
vi.mock('echarts/components', () => ({
  TooltipComponent: {},
  TitleComponent: {},
}))
vi.mock('echarts/renderers', () => ({
  SVGRenderer: {},
}))

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: { isActive: false },
  }),
}))

describe('Pie.vue', () => {
  let wrapper
  const props = {
    title: 'Test Pie Chart',
    endPoint: '/api/charts/pie',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (options = {}) => {
    return mount(Pie, {
      props,
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'v-chart': true,
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-card-actions': { template: '<div><slot /></div>' },
          'q-btn': true,
          'q-btn-dropdown': {
            template: '<div><slot name="label" /><slot /></div>',
          },
          'q-list': { template: '<div><slot /></div>' },
          'q-item': { template: '<div><slot /></div>' },
          'q-icon': true,
          'q-tooltip': true,
          'q-dialog': true,
          'q-table': true,
          BannerInfo: true,
        },
        directives: {
          'close-popup': {},
        },
        ...options,
      },
    })
  }

  it('renders title correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.text()).toContain('Test Pie Chart')
  })

  it('fetches data on mount', async () => {
    mocks.api.get.mockResolvedValue({
      data: {
        total: 10,
        data: [
          { name: 'A', value: 5 },
          { name: 'B', value: 5 },
        ],
      },
    })

    wrapper = createWrapper()
    expect(wrapper.vm.loading).toBe(true)

    await flushPromises()

    expect(mocks.api.get).toHaveBeenCalledWith('/api/charts/pie')
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.data.total).toBe(10)
  })

  it('handles API error correctly', async () => {
    const error = new Error('API Error')
    mocks.api.get.mockRejectedValue(error)

    wrapper = createWrapper()
    await flushPromises()

    // We can't easily check the store action call without importing the store definition
    // but we can check if loading state is reset
    expect(wrapper.vm.loading).toBe(false)
  })

  it('shows no data message when total is 0', async () => {
    mocks.api.get.mockResolvedValue({
      data: {
        total: 0,
        data: [],
      },
    })

    wrapper = createWrapper()
    await flushPromises()

    // BannerInfo should be visible (implied by logic, though stubbed)
    expect(wrapper.vm.noData).toBe(true)
  })
})
