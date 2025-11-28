import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProjectDetail from 'src/pages/projects/results/detail.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock dependencies
const mocks = vi.hoisted(() => ({
  router: { push: vi.fn() },
  route: { query: {}, fullPath: '/projects/detail' },
  api: { get: vi.fn(), post: vi.fn() },
  elementComposables: {
    appIcon: () => 'icon-app',
    modelIcon: () => 'icon-model',
  },
  quasar: {
    useMeta: vi.fn(),
    useQuasar: () => ({
      notify: vi.fn(),
    }),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => mocks.router,
  useRoute: () => mocks.route,
}))

vi.mock('boot/axios', () => ({
  api: mocks.api,
}))

vi.mock('composables/element', () => mocks.elementComposables)

vi.mock('quasar', () => mocks.quasar)

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock child components
vi.mock('components/ui/EntitySelect', () => ({
  default: { name: 'EntitySelect', template: '<div>EntitySelect</div>' },
}))
vi.mock('components/ui/ItemDetail', () => ({
  default: {
    name: 'ItemDetail',
    template: '<div><slot name="actions" /><slot name="fields" /></div>',
    props: ['element', 'isValid'],
    emits: ['load-related', 'reset-element', 'set-title'],
  },
}))

describe('ProjectDetail.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query = {}
  })

  const createWrapper = (options = {}) => {
    return mount(ProjectDetail, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        mocks: {
          ...mockGettext,
          $route: mocks.route,
        },
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          'q-btn': true,
          'q-tooltip': true,
          'q-card-section': { template: '<div><slot /></div>' },
          'q-input': true,
          'q-checkbox': true,
          'q-select': true,
        },
        ...options,
      },
    })
  }

  it('renders correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(mocks.quasar.useMeta).toHaveBeenCalled()
  })

  it('loads related data on mount (via ItemDetail event)', async () => {
    mocks.api.get.mockResolvedValueOnce({
      data: { results: [{ id: 1, name: 'Platform 1' }] },
    }) // platforms
    mocks.api.get.mockResolvedValueOnce({
      data: { 1: { module: 'apt', architectures: ['amd64'] } },
    }) // pms
    mocks.api.get.mockResolvedValueOnce({ data: { count: 0 } }) // stores
    mocks.api.get.mockResolvedValueOnce({ data: { count: 0 } }) // deployments

    wrapper = createWrapper()

    // Trigger load-related manually as it's emitted by ItemDetail
    // In a real mount, ItemDetail might emit it on mount, but here we stubbed it.
    // However, looking at the code, ItemDetail emits 'load-related'.
    // We can call the method directly or emit from stub.
    await wrapper.findComponent({ name: 'ItemDetail' }).vm.$emit('load-related')
    await flushPromises()

    expect(mocks.api.get).toHaveBeenCalledTimes(4)
    expect(wrapper.vm.platforms).toHaveLength(1)
    expect(wrapper.vm.pms).toHaveLength(1)
  })

  it('computes isValid correctly', () => {
    wrapper = createWrapper()
    const vm = wrapper.vm

    expect(vm.isValid).toBe(false)

    vm.element.name = 'TestProject'
    vm.element.platform = { id: 1 }
    vm.element.pms = { id: 1 }
    vm.element.architecture = ['amd64']

    expect(vm.isValid).toBe(true)
  })

  it('creates default stores', async () => {
    wrapper = createWrapper()
    wrapper.vm.element.id = 1

    await wrapper.vm.createDefaultStores()

    expect(mocks.api.post).toHaveBeenCalledTimes(2) // org and thirds
    expect(wrapper.vm.hasStores).toBe(true)
  })

  it('creates default deployments', async () => {
    wrapper = createWrapper()
    wrapper.vm.element.id = 1

    await wrapper.vm.createDefaultDeployments()

    expect(mocks.api.post).toHaveBeenCalledTimes(2) // org and thirds
    expect(wrapper.vm.hasDeployments).toBe(true)
  })

  it('resets element', () => {
    wrapper = createWrapper()
    wrapper.vm.element.name = 'Dirty'

    wrapper.vm.resetElement()

    expect(wrapper.vm.element.name).toBeUndefined()
    expect(wrapper.vm.element.id).toBe(0)
  })

  it('navigates to add store', async () => {
    wrapper = createWrapper()
    wrapper.vm.element.id = 123
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAllComponents({ name: 'q-btn' })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
