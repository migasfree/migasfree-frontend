import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSmartRequest } from 'composables/useSmartRequest'

// Mock the axios api
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Mock the config
vi.mock('config/api', () => ({
  URL_LENGTH_THRESHOLD: 2000,
  FILTER_ENDPOINT_SUFFIX: '/filter/',
  LARGE_FILTER_METHOD: 'POST',
}))

import { api } from 'boot/axios'

describe('useSmartRequest', () => {
  let smartRequest, shouldUsePost, estimateUrlLength, toFilterEndpoint

  beforeEach(() => {
    vi.clearAllMocks()
    const composable = useSmartRequest()
    smartRequest = composable.smartRequest
    shouldUsePost = composable.shouldUsePost
    estimateUrlLength = composable.estimateUrlLength
    toFilterEndpoint = composable.toFilterEndpoint
  })

  describe('estimateUrlLength', () => {
    it('should calculate URL length correctly for simple params', () => {
      const url = '/api/v1/token/computers/'
      const params = { page: 1, status: 'available' }

      const length = estimateUrlLength(url, params)

      // URL + "?" + "page=1&status=available"
      expect(length).toBeGreaterThan(url.length)
      expect(typeof length).toBe('number')
    })

    it('should calculate URL length correctly for array params', () => {
      const url = '/api/v1/token/computers/'
      const params = { id__in: [1, 2, 3, 4, 5] }

      const length = estimateUrlLength(url, params)

      expect(length).toBeGreaterThan(url.length)
    })

    it('should handle empty params', () => {
      const url = '/api/v1/token/computers/'
      const params = {}

      const length = estimateUrlLength(url, params)

      expect(length).toBe(url.length + 1) // Just URL + "?"
    })
  })

  describe('shouldUsePost', () => {
    it('should return false for small parameter sets', () => {
      const url = '/api/v1/token/computers/'
      const params = { page: 1, status: 'available' }

      const result = shouldUsePost(url, params)

      expect(result).toBe(false)
    })

    it('should return true for large parameter sets', () => {
      const url = '/api/v1/token/computers/'
      // Create a large ID array that will exceed threshold
      const largeIdArray = Array.from({ length: 500 }, (_, i) => i + 1)
      const params = { id__in: largeIdArray.join(',') }

      const result = shouldUsePost(url, params)

      expect(result).toBe(true)
    })

    it('should return false for empty params', () => {
      const url = '/api/v1/token/computers/'
      const params = {}

      const result = shouldUsePost(url, params)

      expect(result).toBe(false)
    })

    it('should return false for null params', () => {
      const url = '/api/v1/token/computers/'

      const result = shouldUsePost(url, null)

      expect(result).toBe(false)
    })
  })

  describe('toFilterEndpoint', () => {
    it('should add filter suffix to endpoint', () => {
      const url = '/api/v1/token/computers/'

      const result = toFilterEndpoint(url)

      expect(result).toBe('/api/v1/token/computers/filter/')
    })

    it('should add filter suffix to endpoint without trailing slash', () => {
      const url = '/api/v1/token/computers'

      const result = toFilterEndpoint(url)

      expect(result).toBe('/api/v1/token/computers/filter/')
    })

    it('should not duplicate filter suffix', () => {
      const url = '/api/v1/token/computers/filter/'

      const result = toFilterEndpoint(url)

      expect(result).toBe('/api/v1/token/computers/filter/')
    })

    it('should handle filter suffix without trailing slash', () => {
      const url = '/api/v1/token/computers/filter'

      const result = toFilterEndpoint(url)

      // Since the URL ends with 'filter', it's treated as already having the suffix
      // So it should just ensure it has a trailing slash
      expect(result).toBe('/api/v1/token/computers/filter/')
    })

    it('should NOT add filter suffix for export endpoints', () => {
      const url = '/api/v1/token/computers/export/'

      const result = toFilterEndpoint(url)

      // Export endpoints should stay as is (just ensuring trailing slash)
      expect(result).toBe('/api/v1/token/computers/export/')
    })

    it('should NOT add filter suffix for export endpoints without trailing slash', () => {
      const url = '/api/v1/token/computers/export'

      const result = toFilterEndpoint(url)

      expect(result).toBe('/api/v1/token/computers/export/')
    })
  })

  describe('smartRequest', () => {
    it('should use GET for small parameter sets', async () => {
      const endpoint = '/api/v1/token/computers/'
      const params = { page: 1, status: 'available' }

      api.get.mockResolvedValue({ data: { results: [], count: 0 } })

      await smartRequest(endpoint, params)

      expect(api.get).toHaveBeenCalledWith(endpoint, {
        params,
      })
      expect(api.post).not.toHaveBeenCalled()
    })

    // Note: POST behavior is tested indirectly through shouldUsePost() and toFilterEndpoint() tests
    // which verify that large parameter sets would trigger POST and that endpoints are transformed correctly

    it('should pass additional options to the request', async () => {
      const endpoint = '/api/v1/token/computers/'
      const params = { page: 1 }
      const options = {
        headers: { 'X-Custom': 'test' },
        timeout: 5000,
      }

      api.get.mockResolvedValue({ data: {} })

      await smartRequest(endpoint, params, options)

      expect(api.get).toHaveBeenCalledWith(endpoint, {
        params,
        ...options,
      })
    })

    it('should handle empty params with GET', async () => {
      const endpoint = '/api/v1/token/computers/'

      api.get.mockResolvedValue({ data: {} })

      await smartRequest(endpoint)

      expect(api.get).toHaveBeenCalled()
    })
  })

  describe('smartExportRequest', () => {
    const { smartExportRequest } = useSmartRequest()

    it('should set responseType to blob', async () => {
      const endpoint = '/api/v1/token/computers/export/'
      const params = { id__in: '1,2,3' }

      api.get.mockResolvedValue({ data: new Blob(), headers: {} })

      await smartExportRequest(endpoint, params)

      expect(api.get).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          responseType: 'blob',
        }),
      )
    })
  })
})
