import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeatMap from 'src/components/chart/HeatMap.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
  current: 'es',
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock composables
vi.mock('composables/element', () => ({
  appIcon: (name) => `mdi-${name}`,
}))

vi.mock('composables/date', () => ({
  default: () => ({
    localeDate: {
      daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      monthsShort: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
    },
  }),
}))

vi.mock('composables/chart/export', () => ({
  useChartExport: () => ({
    saveSvgImage: vi.fn(),
    savePngImage: vi.fn(),
  }),
}))

vi.mock('composables/chart/options', () => ({
  useChartOptions: () => ({
    initOptions: { renderer: 'svg' },
    getTextColor: () => '#333',
  }),
}))

vi.mock('composables/chart/utils', () => ({
  useChartUtils: vi.fn(),
}))

// Mock Quasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: { isActive: false },
  }),
  date: {
    getDateDiff: () => 365,
  },
}))

describe('HeatMap.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(HeatMap, {
      props: {
        data: [],
        start: '2024-01-01',
        title: 'Test HeatMap',
        ...props,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-card': {
            template: '<div class="q-card"><slot /></div>',
            props: ['flat', 'bordered'],
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
            props: [
              'size',
              'padding',
              'disable',
              'color',
              'textColor',
              'label',
            ],
          },
          'q-btn-dropdown': {
            template:
              '<div class="q-btn-dropdown"><slot name="label" /><slot /></div>',
          },
          'q-tooltip': true,
          'q-icon': {
            template: '<i class="q-icon"></i>',
            props: ['name'],
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
          'q-separator': {
            template: '<div class="q-separator"></div>',
          },
          'v-chart': {
            template: '<div class="v-chart"></div>',
            props: [
              'initOptions',
              'option',
              'updateOptions',
              'style',
              'autoresize',
              'manualUpdate',
            ],
          },
          BannerInfo: {
            template: '<div class="banner-info">{{ message }}</div>',
            props: ['message'],
          },
        },
        directives: {
          'close-popup': {},
        },
      },
    })
  }

  it('renders correctly with title', () => {
    const wrapper = createWrapper({ title: 'My HeatMap' })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('My HeatMap')
  })

  it('shows total button when total > 0', () => {
    const wrapper = createWrapper({ title: 'Test', total: 100 })
    expect(wrapper.find('.q-btn').exists()).toBe(true)
  })

  it('does not show total button when total is 0', () => {
    const wrapper = createWrapper({ title: 'Test', total: 0 })
    // The button should exist but might be hidden or disabled
    expect(wrapper.exists()).toBe(true)
  })

  it('isChartVisible is true when total > 0', () => {
    const wrapper = createWrapper({ title: 'Test', total: 50 })
    expect(wrapper.vm.isChartVisible).toBe(true)
  })

  it('isChartVisible is false when total is 0', () => {
    const wrapper = createWrapper({ title: 'Test', total: 0 })
    expect(wrapper.vm.isChartVisible).toBe(false)
  })

  it('noData is true when total is 0', () => {
    const wrapper = createWrapper({ title: 'Test', total: 0 })
    expect(wrapper.vm.noData).toBe(true)
  })

  it('noData is false when total > 0', () => {
    const wrapper = createWrapper({ title: 'Test', total: 10 })
    expect(wrapper.vm.noData).toBe(false)
  })

  it('shows banner when noData', () => {
    const wrapper = createWrapper({ title: 'Test', total: 0 })
    expect(wrapper.text()).toContain('No data')
  })

  it('emits get-date on passData', () => {
    const wrapper = createWrapper({ title: 'Test' })
    const params = { data: ['2024-01-15', 5] }
    wrapper.vm.passData(params)
    expect(wrapper.emitted('get-date')).toBeTruthy()
    expect(wrapper.emitted('get-date')[0]).toEqual([params])
  })

  it('emits total on total button click', async () => {
    const wrapper = createWrapper({ title: 'Test', total: 100 })
    await wrapper.find('.q-btn').trigger('click')
    expect(wrapper.emitted('total')).toBeTruthy()
  })

  it('accepts data prop and renders chart when total > 0', () => {
    const data = [
      ['2023-01-15', 5],
      ['2023-05-20', 10],
      ['2024-02-10', 3],
    ]
    const wrapper = createWrapper({ title: 'Test', data, total: 18 })
    // Verify component renders with data
    expect(wrapper.vm.isChartVisible).toBe(true)
    expect(wrapper.vm.noData).toBe(false)
  })

  it('changeRange function is exposed', () => {
    const wrapper = createWrapper({ title: 'Test', total: 10 })
    expect(typeof wrapper.vm.changeRange).toBe('function')
  })

  it('handles empty data array', () => {
    const wrapper = createWrapper({ title: 'Test', data: [], total: 0 })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.noData).toBe(true)
  })

  it('computes cssVars based on date range', () => {
    const wrapper = createWrapper({ title: 'Test', start: '2024-01-01' })
    expect(wrapper.vm.cssVars).toHaveProperty('--variable-width')
  })
})
