import { LocalStorageCache, SessionStorageCache } from './cache.js'
import { getQueryName } from './getQueryName.js'

export async function execute<T>({
  method = 'POST',
  endpoint,
  query,
  operationName,
  variables,
  headers,
  cache,
  maxAge = 24 * 60 * 60,
  forceRefresh = false
}: {
  /**
   * The HTTP method to use.
   * @default 'POST'
   */
  method?: string
  /**
   * The GraphQL endpoint to send the request to
   */
  endpoint: string
  /**
   * The GraphQL query to send with the request
   */
  query: string
  /**
   * The operation name to send with the request
   */
  operationName?: string
  /**
   * The variables to send with the request
   */
  variables?: Record<string, any>
  /**
   * The headers to send with the request
   */
  headers?: Record<string, string>
  /**
   * The cache type to use.
   * If `localStorage` or `sessionStorage` is provided, the cache will be enabled.
   */
  cache?: 'localStorage' | 'sessionStorage'
  /**
   * The max age of the cache [s]
   */
  maxAge?: number
  /**
   * Force refresh the cache (disable cache).
   * @default false
   */
  forceRefresh?: boolean
}): Promise<T> {
  let enableCache = cache != null
  if (forceRefresh) enableCache = false

  let cacheInstance: LocalStorageCache<T> | SessionStorageCache<T> | undefined =
    undefined

  const queryName = operationName ?? getQueryName(query)
  if (queryName == null) enableCache = false

  if (enableCache) {
    if (cache === 'localStorage') {
      const cacheKey = `graphql:cache:${queryName}`
      cacheInstance = new LocalStorageCache<T>(cacheKey)
    } else if (cache === 'sessionStorage') {
      const cacheKey = `graphql:cache:${queryName}`
      cacheInstance = new SessionStorageCache<T>(cacheKey)
    }
  }

  if (enableCache && cacheInstance != null) {
    const cachedData = cacheInstance.get()
    if (cachedData != null) return cachedData
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ query, variables, operationName })
  })

  const { data, errors }: { data: T; errors: any } = await response.json()

  if (errors) {
    throw new Error(JSON.stringify(errors, null, 2))
  }

  if (enableCache && cacheInstance != null) {
    cacheInstance.set({ maxAge, data })
  }

  return data
}
