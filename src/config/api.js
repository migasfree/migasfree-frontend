/**
 * API Configuration
 *
 * Centralized configuration for API requests and smart filtering
 */

/**
 * Maximum safe URL length for GET requests (in characters)
 * URLs longer than this will trigger automatic POST conversion
 *
 * Standard limits:
 * - IE: 2047 chars
 * - Chrome: ~8000 chars (but 2000 is safe for all browsers)
 * - HTTP spec: no limit, but servers typically limit to 2048-8192
 */
export const URL_LENGTH_THRESHOLD = 2000

/**
 * Endpoint suffix for POST-based filter requests
 * When a request needs POST due to size, this suffix is appended to the endpoint
 *
 * Example: /api/v1/token/computers/ -> /api/v1/token/computers/filter/
 */
export const FILTER_ENDPOINT_SUFFIX = '/filter/'

/**
 * Feature flag for HTTP QUERY method support
 *
 * The HTTP QUERY method (RFC draft) is designed for this exact use case:
 * safe, idempotent queries with request body.
 *
 * Set to true when:
 * 1. HTTP QUERY RFC is finalized
 * 2. Browsers support it natively
 * 3. Backend framework supports it
 * 4. axios/fetch libraries support it
 *
 * @see https://www.ietf.org/archive/id/draft-ietf-httpbis-safe-method-w-body-02.html
 */
export const FUTURE_QUERY_METHOD_ENABLED = false

/**
 * HTTP method to use for large filter requests
 * Will switch to 'QUERY' when FUTURE_QUERY_METHOD_ENABLED is true
 */
export const LARGE_FILTER_METHOD = FUTURE_QUERY_METHOD_ENABLED
  ? 'QUERY'
  : 'POST'
