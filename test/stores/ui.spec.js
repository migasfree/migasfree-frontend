import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from 'src/stores/ui'

// Mock Quasar
const mockNotifyCreate = vi.fn()
vi.mock('quasar', () => ({
  scroll: {
    getScrollTarget: vi.fn(() => document.body),
    setVerticalScrollPosition: vi.fn(),
  },
  Notify: {
    create: (options) => mockNotifyCreate(options),
  },
}))

// Mock composables
vi.mock('composables/element', () => ({
  appIcon: (name) => `mdi-${name}`,
}))

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockNotifyCreate.mockClear()
  })

  describe('state', () => {
    it('has correct initial state', () => {
      const store = useUiStore()
      expect(store.isLoading).toBe(false)
      expect(store.currentPageTable).toBe(1)
      expect(store.server).toBeDefined()
    })
  })

  describe('loading actions', () => {
    it('loading() sets isLoading to true', () => {
      const store = useUiStore()
      expect(store.isLoading).toBe(false)
      store.loading()
      expect(store.isLoading).toBe(true)
    })

    it('finished() sets isLoading to false', () => {
      const store = useUiStore()
      store.loading()
      expect(store.isLoading).toBe(true)
      store.finished()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('setCurrentPageTable', () => {
    it('updates currentPageTable value', () => {
      const store = useUiStore()
      expect(store.currentPageTable).toBe(1)
      store.setCurrentPageTable(5)
      expect(store.currentPageTable).toBe(5)
    })
  })

  describe('notifyError', () => {
    it('creates error notification with string message', () => {
      const store = useUiStore()
      store.notifyError('Test error message')
      expect(mockNotifyCreate).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        message: 'Test error message',
        icon: 'mdi-error',
      })
    })

    it('creates error notification with Error object', () => {
      const store = useUiStore()
      store.notifyError(new Error('Error object message'))
      expect(mockNotifyCreate).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        message: 'Error object message',
        icon: 'mdi-error',
      })
    })

    it('handles 401 status', () => {
      const store = useUiStore()
      store.notifyError({ response: { status: 401 } })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'UnAuthorized' }),
      )
    })

    it('handles 403 status', () => {
      const store = useUiStore()
      store.notifyError({ response: { status: 403 } })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Forbidden' }),
      )
    })

    it('handles 404 status', () => {
      const store = useUiStore()
      store.notifyError({ response: { status: 404 } })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'API Route is Missing or Undefined',
        }),
      )
    })

    it('handles 405 status', () => {
      const store = useUiStore()
      store.notifyError({ response: { status: 405 } })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'API Route Method Not Allowed' }),
      )
    })

    it('handles 422 status', () => {
      const store = useUiStore()
      store.notifyError({ response: { status: 422 } })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Validation Error' }),
      )
    })

    it('handles 500+ status', () => {
      const store = useUiStore()
      store.notifyError({ response: { status: 500 } })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Server Error' }),
      )
    })

    it('uses response data string as message', () => {
      const store = useUiStore()
      store.notifyError({
        response: { status: 400, data: 'Custom error from server' },
      })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Custom error from server' }),
      )
    })

    it('uses first key from response data object', () => {
      const store = useUiStore()
      store.notifyError({
        response: { status: 400, data: { username: 'Username is required' } },
      })
      expect(mockNotifyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Username is required' }),
      )
    })
  })

  describe('notifySuccess', () => {
    it('creates success notification', () => {
      const store = useUiStore()
      store.notifySuccess('Operation completed')
      expect(mockNotifyCreate).toHaveBeenCalledWith({
        color: 'positive',
        position: 'bottom',
        message: 'Operation completed',
        icon: 'mdi-yes',
      })
    })
  })

  describe('scrollToElement', () => {
    it('is a function', () => {
      const store = useUiStore()
      expect(typeof store.scrollToElement).toBe('function')
    })
  })
})
