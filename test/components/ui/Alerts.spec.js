import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Alerts from 'src/components/ui/Alerts.vue'

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

// Mock Pinia stores
const mockLoggedIn = { value: true }
const mockAuthStore = {
  loggedIn: mockLoggedIn,
}
const mockUiStore = {
  server: 'http://localhost:8080',
  notifyError: vi.fn(),
}

vi.mock('pinia', () => ({
  storeToRefs: (store) => store,
}))

vi.mock('stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

vi.mock('stores/ui', () => ({
  useUiStore: () => mockUiStore,
}))

// Mock boot/axios
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

// Mock Quasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    localStorage: { remove: vi.fn() },
  }),
}))

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock WebSocket - don't auto-close to avoid setTimeout error in component
class MockWebSocket {
  constructor() {
    this.onmessage = null
    this.onclose = null
    this.onerror = null
    this.readyState = 1 // OPEN
  }
  close() {
    this.readyState = 3 // CLOSED
  }
  send() {}
}

global.WebSocket = MockWebSocket

describe('Alerts.vue', () => {
  const createWrapper = (options = {}) => {
    return mount(Alerts, {
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-btn-dropdown': {
            template:
              '<div class="q-btn-dropdown" v-if="$attrs.modelValue !== false"><slot name="label" /><slot /></div>',
          },
          'q-icon': {
            template: '<i class="q-icon"></i>',
            props: ['name'],
          },
          'q-chip': {
            template: '<span class="q-chip">{{ label }}</span>',
            props: ['label', 'color', 'textColor'],
          },
          'q-tooltip': true,
          'q-list': {
            template: '<div class="q-list"><slot /></div>',
          },
          'q-item': {
            template: '<div class="q-item"><slot /></div>',
            props: ['to'],
          },
          'q-item-section': {
            template: '<span class="q-item-section"><slot /></span>',
          },
          'q-item-label': {
            template: '<span class="q-item-label"><slot /></span>',
          },
        },
      },
      ...options,
    })
  }

  beforeEach(() => {
    mockLoggedIn.value = true
    mockPush.mockClear()
    mockUiStore.notifyError.mockClear()
  })

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('target returns laptop icon for computer', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.target('computer')).toBe('mdi-laptop')
  })

  it('target returns cloud icon for non-computer', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.target('server')).toBe('mdi-cloud')
  })

  it('level returns negative for critical', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.level('critical')).toBe('negative')
  })

  it('level returns same value for non-critical', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.level('warning')).toBe('warning')
    expect(wrapper.vm.level('info')).toBe('info')
  })

  it('textColor returns white for critical', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.textColor('critical')).toBe('white')
  })

  it('textColor returns black for non-critical', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.textColor('warning')).toBe('black')
  })

  it('resolveAlertLink handles errors model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertLink({ model: 'errors', query: {} })
    expect(result).toEqual({ name: 'errors-list', query: {} })
  })

  it('resolveAlertLink handles faults model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertLink({ model: 'faults', query: {} })
    expect(result).toEqual({ name: 'faults-list', query: {} })
  })

  it('resolveAlertLink handles notifications model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertLink({
      model: 'notifications',
      query: {},
    })
    expect(result).toEqual({ name: 'notifications-list', query: {} })
  })

  it('resolveAlertLink handles packages model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertLink({ model: 'packages', query: {} })
    expect(result).toEqual({ name: 'packages-list', query: {} })
  })

  it('resolveAlertLink handles deployments model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertLink({
      model: 'deployments',
      query: {},
    })
    expect(result).toEqual({ name: 'deployments-list', query: {} })
  })

  it('resolveAlertLink handles boolean query values', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertLink({
      model: 'errors',
      query: { checked: false },
    })
    expect(result.query.checked).toBe('false')
  })

  it('resolveAlertText returns Orphan Packages for packages model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'packages' },
      msg: 'default',
    })
    expect(result).toBe('Orphan Packages')
  })

  it('resolveAlertText returns Unchecked Notifications for notifications model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'notifications' },
      msg: 'default',
    })
    expect(result).toBe('Unchecked Notifications')
  })

  it('resolveAlertText returns Unchecked Faults for faults model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'faults' },
      msg: 'default',
    })
    expect(result).toBe('Unchecked Faults')
  })

  it('resolveAlertText returns Unchecked Errors for errors model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'errors' },
      msg: 'default',
    })
    expect(result).toBe('Unchecked Errors')
  })

  it('resolveAlertText handles deployments with id_in query', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'deployments', query: { id_in: [1, 2] } },
      msg: 'default',
    })
    expect(result).toBe('Generating Repositories')
  })

  it('resolveAlertText handles deployments with percent__lt query', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'deployments', query: { percent__lt: 100 } },
      msg: 'default',
    })
    expect(result).toBe('Active schedule Deployments')
  })

  it('resolveAlertText handles deployments with percent__gte query', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'deployments', query: { percent__gte: 100 } },
      msg: 'default',
    })
    expect(result).toBe('Finished schedule Deployments')
  })

  it('resolveAlertText handles messages with created_at__gte query', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'messages', query: { created_at__gte: '2024-01-01' } },
      msg: 'default',
    })
    expect(result).toBe('Synchronizing Computers Now')
  })

  it('resolveAlertText handles messages with created_at__lt query', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'messages', query: { created_at__lt: '2024-01-01' } },
      msg: 'default',
    })
    expect(result).toBe('Delayed Computers')
  })

  it('resolveAlertText returns msg for unknown model', () => {
    const wrapper = createWrapper()
    const result = wrapper.vm.resolveAlertText({
      api: { model: 'unknown' },
      msg: 'Custom message',
    })
    expect(result).toBe('Custom message')
  })
})
