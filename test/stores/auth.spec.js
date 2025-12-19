import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from 'src/stores/auth'

// Mock Quasar LocalStorage with proper defaults
const mockLocalStorage = new Map()

// Initialize default values for domains and scopes
const defaultDomains = [{ id: 0, name: 'All' }]
const defaultScopes = [{ id: 0, name: 'all' }]

vi.mock('quasar', () => ({
  LocalStorage: {
    getItem: (key) => {
      if (mockLocalStorage.has(key)) return mockLocalStorage.get(key)
      // Return defaults for arrays and objects
      if (key === 'auth.domains') return defaultDomains
      if (key === 'auth.scopes') return defaultScopes
      if (key === 'auth.user') return {}
      return null
    },
    set: (key, value) => mockLocalStorage.set(key, value),
    remove: (key) => mockLocalStorage.delete(key),
  },
}))

// Mock boot/axios
const mockApiPost = vi.fn()
const mockApiGet = vi.fn()
vi.mock('boot/axios', () => ({
  api: {
    post: (...args) => mockApiPost(...args),
    get: (...args) => mockApiGet(...args),
  },
}))

// Mock boot/gettext
vi.mock('boot/gettext', () => ({
  gettext: {
    $gettext: (msg) => msg,
  },
}))

// Mock ui store
const mockNotifyError = vi.fn()
vi.mock('./ui.js', () => ({
  useUiStore: () => ({
    notifyError: mockNotifyError,
  }),
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLocalStorage.clear()
    mockApiPost.mockClear()
    mockApiGet.mockClear()
    mockNotifyError.mockClear()
  })

  describe('initial state', () => {
    it('has correct initial state when no localStorage', () => {
      const store = useAuthStore()
      // Token, user, etc. should be empty/default
      expect(store.loggedIn).toBeFalsy()
      expect(store.domains).toBeDefined()
      expect(store.scopes).toBeDefined()
    })
  })

  describe('reset', () => {
    it('resets all auth state', () => {
      const store = useAuthStore()
      // Set some state first
      store.token = 'test-token'
      store.loggedIn = true

      // Reset
      store.reset()

      // Verify reset
      expect(store.token).toBe('')
      expect(store.loggedIn).toBe(false)
    })
  })

  describe('addDomain', () => {
    it('adds a new domain', () => {
      const store = useAuthStore()
      const initialLength = store.domains.length

      store.addDomain({ id: 1, name: 'Test Domain' })

      expect(store.domains.length).toBe(initialLength + 1)
      expect(store.domains.find((d) => d.name === 'Test Domain')).toBeDefined()
    })

    it('does not add duplicate domain by name', () => {
      const store = useAuthStore()
      store.addDomain({ id: 1, name: 'Test Domain' })
      const lengthAfterFirst = store.domains.length

      store.addDomain({ id: 2, name: 'Test Domain' })

      expect(store.domains.length).toBe(lengthAfterFirst)
    })

    it('sorts domains by name', () => {
      const store = useAuthStore()
      store.addDomain({ id: 1, name: 'Zebra Domain' })
      store.addDomain({ id: 2, name: 'Alpha Domain' })

      // Find indices (excluding id: 0 which is "All")
      const alphaIndex = store.domains.findIndex(
        (d) => d.name === 'Alpha Domain',
      )
      const zebraIndex = store.domains.findIndex(
        (d) => d.name === 'Zebra Domain',
      )

      expect(alphaIndex).toBeLessThan(zebraIndex)
    })
  })

  describe('deleteDomain', () => {
    it('deletes a domain by id', () => {
      const store = useAuthStore()
      store.addDomain({ id: 1, name: 'Test Domain' })
      expect(store.domains.find((d) => d.id === 1)).toBeDefined()

      store.deleteDomain(1)

      expect(store.domains.find((d) => d.id === 1)).toBeUndefined()
    })

    it('does nothing if domain id not found', () => {
      const store = useAuthStore()
      const initialLength = store.domains.length

      store.deleteDomain(999)

      expect(store.domains.length).toBe(initialLength)
    })
  })

  describe('addScope', () => {
    it('adds a new scope', () => {
      const store = useAuthStore()
      const initialLength = store.scopes.length

      store.addScope({ id: 1, name: 'Test Scope', domain: { id: 1 } })

      expect(store.scopes.length).toBe(initialLength + 1)
      expect(store.scopes.find((s) => s.name === 'Test Scope')).toBeDefined()
    })

    it('does not add duplicate scope by name', () => {
      const store = useAuthStore()
      store.addScope({ id: 1, name: 'Test Scope' })
      const lengthAfterFirst = store.scopes.length

      store.addScope({ id: 2, name: 'Test Scope' })

      expect(store.scopes.length).toBe(lengthAfterFirst)
    })
  })

  describe('deleteScope', () => {
    it('deletes a scope by id', () => {
      const store = useAuthStore()
      store.addScope({ id: 1, name: 'Test Scope' })
      expect(store.scopes.find((s) => s.id === 1)).toBeDefined()

      store.deleteScope(1)

      expect(store.scopes.find((s) => s.id === 1)).toBeUndefined()
    })
  })

  describe('setUser', () => {
    it('sets user data', () => {
      const store = useAuthStore()
      const userData = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        is_staff: true,
      }

      store.setUser(userData)

      expect(store.user).toEqual(userData)
    })
  })

  describe('filteredScopes', () => {
    it('returns all scopes when no domain preference', () => {
      const store = useAuthStore()
      store.addScope({ id: 1, name: 'Scope A', domain: { id: 1 } })
      store.addScope({ id: 2, name: 'Scope B', domain: { id: 2 } })

      expect(store.filteredScopes.length).toBe(3) // 2 added + 1 default "All"
    })

    it('filters scopes by domain preference', () => {
      const store = useAuthStore()
      store.setUser({ domain_preference: { id: 1 } })
      store.addScope({ id: 1, name: 'Scope A', domain: { id: 1 } })
      store.addScope({ id: 2, name: 'Scope B', domain: { id: 2 } })

      const filtered = store.filteredScopes
      // Should include "All" (id: 0) and Scope A (domain 1), but not Scope B
      expect(filtered.some((s) => s.id === 0)).toBe(true)
      expect(filtered.some((s) => s.name === 'Scope A')).toBe(true)
      expect(filtered.some((s) => s.name === 'Scope B')).toBe(false)
    })
  })

  describe('getServerInfo', () => {
    it('fetches server info', async () => {
      const store = useAuthStore()
      const serverData = { version: '1.0.0', organization: 'Test Org' }
      mockApiGet.mockResolvedValueOnce({ data: serverData })

      await store.getServerInfo()

      expect(mockApiGet).toHaveBeenCalledWith('/api/v1/public/server/info/')
      expect(store.server).toEqual(serverData)
    })
  })
})
