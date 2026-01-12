import { stringify } from 'qs'
import { api } from 'boot/axios'
import {
  URL_LENGTH_THRESHOLD,
  FILTER_ENDPOINT_SUFFIX,
  LARGE_FILTER_METHOD,
} from 'config/api'

/**
 * Smart Request Composable
 *
 * Automatically switches between GET and POST based on parameter size
 * to avoid URL length limitations.
 *
 * @example
 * const { smartRequest } = useSmartRequest()
 *
 * // Small params -> GET /api/v1/token/computers/?page=1&status=available
 * const response = await smartRequest('/api/v1/token/computers/', { page: 1, status: 'available' })
 *
 * // Large params -> POST /api/v1/token/computers/filter/ with body
 * const response = await smartRequest('/api/v1/token/computers/', { id__in: [1,2,3,...,1000] })
 */
export function useSmartRequest() {
  /**
   * Estimate the URL length that would be created with given parameters
   *
   * @param {string} baseUrl - The base URL (e.g., '/api/v1/token/computers/')
   * @param {Object} params - Query parameters object
   * @returns {number} Estimated URL length in characters
   */
  const estimateUrlLength = (baseUrl, params) => {
    const queryString = stringify(params, { arrayFormat: 'comma' })
    return baseUrl.length + queryString.length + 1 // +1 for '?'
  }

  /**
   * Determine if parameters would exceed safe URL length
   *
   * @param {string} url - The endpoint URL
   * @param {Object} params - Query parameters
   * @returns {boolean} True if POST should be used instead of GET
   */
  const shouldUsePost = (url, params) => {
    if (!params || Object.keys(params).length === 0) return false

    const estimatedLength = estimateUrlLength(url, params)
    return estimatedLength > URL_LENGTH_THRESHOLD
  }

  /**
   * Convert endpoint URL to filter endpoint
   * Adds the filter suffix if not already present
   *
   * @param {string} url - Original endpoint URL
   * @returns {string} Filter endpoint URL
   */
  const toFilterEndpoint = (url) => {
    // Remove trailing slash if present
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url

    // Special case: Export endpoints don't need /filter/ suffix
    // POST /api/.../export/ is semantically correct and doesn't conflict with create
    if (cleanUrl.endsWith('/export')) {
      return cleanUrl + '/'
    }

    // Add filter suffix if not already there
    if (cleanUrl.endsWith(FILTER_ENDPOINT_SUFFIX.slice(0, -1))) {
      // URL already ends with '/filter', just ensure trailing slash
      return cleanUrl + '/'
    }

    return cleanUrl + FILTER_ENDPOINT_SUFFIX
  }

  /**
   * Make a smart request that automatically chooses GET or POST
   * based on parameter size
   *
   * @param {string} endpoint - API endpoint URL
   * @param {Object} params - Query/filter parameters
   * @param {Object} options - Additional axios options (headers, responseType, etc.)
   * @returns {Promise} Axios response promise
   */
  const smartRequest = async (endpoint, params = {}, options = {}) => {
    const usePost = shouldUsePost(endpoint, params)

    if (process.env.NODE_ENV === 'development') {
      const method = usePost ? LARGE_FILTER_METHOD : 'GET'
      const size = estimateUrlLength(endpoint, params)
      console.debug(
        `[SMART REQUEST] ${method} ${endpoint}`,
        `(${size} chars)`,
        usePost ? '→ using POST due to size' : '',
      )
    }

    if (usePost) {
      // Use POST with filter endpoint
      const filterEndpoint = toFilterEndpoint(endpoint)
      return await api({
        method: LARGE_FILTER_METHOD.toLowerCase(),
        url: filterEndpoint,
        data: params,
        ...options,
      })
    } else {
      // Use standard GET
      return await api.get(endpoint, {
        params,
        ...options,
      })
    }
  }

  /**
   * Make a smart request for export/download endpoints
   * Handles blob responses and maintains all smart request benefits
   *
   * @param {string} endpoint - Export endpoint URL
   * @param {Object} params - Filter parameters
   * @returns {Promise} Axios response with blob data
   */
  const smartExportRequest = async (endpoint, params = {}) => {
    return await smartRequest(endpoint, params, {
      responseType: 'blob',
    })
  }

  return {
    smartRequest,
    smartExportRequest,
    shouldUsePost,
    estimateUrlLength,
    toFilterEndpoint,
  }
}
