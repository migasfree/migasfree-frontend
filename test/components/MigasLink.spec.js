import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MigasLink from 'src/components/MigasLink.vue'
import { createTestingPinia } from '@pinia/testing'

// Mocks
const mockRouter = {
  push: vi.fn(),
  resolve: vi.fn().mockReturnValue({ matched: ['found'] }),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
  },
}))

vi.mock('composables/element', () => ({
  modelIcon: () => 'icon-model',
  useElement: () => ({
    computerStatus: (val) => val,
    elementIcon: () => 'icon-element',
  }),
}))

vi.mock('config/app.conf', () => ({
  MAX_PREFIX_LEN: 3,
}))

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

describe('MigasLink.vue', () => {
  let wrapper
  const props = {
    model: 'computers',
    pk: 123,
    value: 'My Computer',
    tooltip: 'available, project, 192.168.1.1, user',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    wrapper = mount(MigasLink, {
      props,
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        mocks: {
          ...mockGettext,
          $q: { dark: { isActive: false } }, // Mock Quasar $q
        },
        stubs: {
          'q-btn-dropdown': {
            template: '<div><slot name="label" /><slot /></div>',
          },
          'q-icon': true,
          'q-chip': true,
          'q-avatar': true,
          'q-tooltip': true,
          'q-list': true,
          'q-item': true,
          'q-item-section': true,
          'q-btn': true,
        },
        directives: {
          ripple: {},
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('My Computer')
  })

  it('computes link correctly', () => {
    wrapper = mount(MigasLink, {
      props,
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        mocks: {
          ...mockGettext,
          $q: { dark: { isActive: false } },
        },
        stubs: {
          'q-btn-dropdown': true,
          'q-icon': true,
          'q-chip': true,
          'q-avatar': true,
          'q-tooltip': true,
          'q-list': true,
          'q-item': true,
          'q-item-section': true,
          'q-btn': true,
        },
        directives: {
          ripple: {},
        },
      },
    })

    expect(wrapper.vm.link).toBe('/computers/results/123')
  })
})
