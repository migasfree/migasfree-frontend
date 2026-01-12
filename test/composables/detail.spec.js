import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'

// Mock dependencies using vi.hoisted
const mocks = vi.hoisted(() => ({
  route: {
    params: { id: null },
    name: 'computer-detail',
  },
  router: { push: vi.fn() },
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  emit: vi.fn(),
}))

// Setup mocks
vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router,
  onBeforeRouteLeave: vi.fn(),
}))

vi.mock('boot/axios', () => ({
  api: mocks.api,
}))

vi.mock('stores/ui', () => ({
  useUiStore: () => ({
    notifySuccess: mocks.notifySuccess,
    notifyError: mocks.notifyError,
  }),
}))

vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

// Mock getCurrentInstance for emit
vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getCurrentInstance: () => ({ emit: mocks.emit }),
    onMounted: vi.fn((fn) => fn()),
  }
})

// Finally import composable
import useDetail from 'src/composables/detail'

describe('detail.js', () => {
  let breadcrumbs
  let element
  const routes = {
    list: 'computers-list',
    add: 'computer-add',
    detail: 'computer-detail',
  }
  const originalTitle = 'Device'
  const model = 'devices'

  beforeEach(() => {
    vi.clearAllMocks()
    breadcrumbs = reactive([])
    element = reactive({ id: null, name: '' })
    mocks.route.params.id = null
    mocks.route.name = 'computer-list'
  })

  it('initializes correctly', () => {
    const { loading, elementText } = useDetail(
      originalTitle,
      model,
      routes,
      breadcrumbs,
      element,
    )
    expect(loading.value).toBe(false)
    expect(elementText.value).toBe('')
  })

  describe('onMounted', () => {
    it('fetches data when route has id', async () => {
      mocks.route.params.id = '123'
      const responseData = { id: 123, name: 'Test Device' }
      mocks.api.get.mockResolvedValue({ data: responseData })

      useDetail(originalTitle, model, routes, breadcrumbs, element)

      // Wait for onMounted (mocked to run immediately but async fetch needs tick)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mocks.api.get).toHaveBeenCalledWith('/api/v1/token/devices/123/')
      expect(element.name).toBe('Test Device')
      expect(mocks.emit).toHaveBeenCalledWith('setTitle', 'Device: Test Device')
    })
  })

  describe('updateElement', () => {
    it('creates new element (POST)', async () => {
      const { updateElement } = useDetail(
        originalTitle,
        model,
        routes,
        breadcrumbs,
        element,
        () => ({ name: 'New Device' }),
      )
      mocks.api.post.mockResolvedValue({ data: { id: 1, name: 'New Device' } })

      await updateElement('return')

      expect(mocks.api.post).toHaveBeenCalledWith(
        '/api/v1/token/devices/',
        { name: 'New Device' },
        {},
      )
      expect(mocks.notifySuccess).toHaveBeenCalled()
      expect(mocks.router.push).toHaveBeenCalledWith({ name: 'computers-list' })
    })

    it('updates existing element (PATCH)', async () => {
      element.id = 1
      element.name = 'Old Name'

      const { updateElement } = useDetail(
        originalTitle,
        model,
        routes,
        breadcrumbs,
        element,
        () => ({ name: 'Updated Name' }),
      )
      mocks.api.patch.mockResolvedValue({
        data: { id: 1, name: 'Updated Name' },
      })

      await updateElement()

      expect(mocks.api.patch).toHaveBeenCalledWith(
        '/api/v1/token/devices/1/',
        { name: 'Updated Name' },
        {},
      )
      expect(mocks.notifySuccess).toHaveBeenCalled()
    })

    it('handles error during update', async () => {
      const { updateElement } = useDetail(
        originalTitle,
        model,
        routes,
        breadcrumbs,
        element,
      )
      const error = new Error('Save failed')
      mocks.api.post.mockRejectedValue(error)

      await updateElement()

      expect(mocks.notifyError).toHaveBeenCalledWith(error)
    })
  })

  describe('remove', () => {
    it('deletes element and redirects', async () => {
      element.id = 1
      const { remove } = useDetail(
        originalTitle,
        model,
        routes,
        breadcrumbs,
        element,
      )
      mocks.api.delete.mockResolvedValue({})

      await remove()

      expect(mocks.api.delete).toHaveBeenCalledWith('/api/v1/token/devices/1/')
      expect(mocks.emit).toHaveBeenCalledWith('postRemove')
      expect(mocks.router.push).toHaveBeenCalledWith({ name: 'computers-list' })
    })
  })
})
