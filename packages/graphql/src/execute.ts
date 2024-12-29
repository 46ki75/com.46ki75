import { LocalStorageCache, SessionStorageCache } from './cache'
import { getQueryName } from './getQueryName'

export async function execute<T>({
  method = 'POST',
  endpoint,
  query,
  operationName,
  variables,
  headers,
  cache,
  maxAge = 24 * 60 * 60,
  forceRefresh = true
}: {
  method?: string
  endpoint: string
  query: string
  operationName?: string
  variables?: Record<string, any>
  headers?: Record<string, string>
  cache?: 'localStorage' | 'sessionStorage'
  maxAge?: number
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
