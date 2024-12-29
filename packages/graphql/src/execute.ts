import { LocalStorageCache, SessionStorageCache } from './cache'
import { getQueryName } from './getQueryName'

export async function execute<T>({
  endpoint,
  query,
  operationName,
  variables,
  headers,
  cache,
  maxAge = 24 * 60 * 60,
  forceRefresh = true
}: {
  endpoint: string
  query: string
  operationName?: string
  variables?: Record<string, any>
  headers?: Record<string, string>
  cache?: 'localStorage' | 'sessionStorage'
  maxAge?: number
  forceRefresh?: boolean
}): Promise<T> {
  let cacheInstance: LocalStorageCache<T> | SessionStorageCache<T> | undefined =
    undefined

  if (cache === 'localStorage') {
    const queryName = operationName ?? getQueryName(query)
    const cacheKey = `graphql:cache:${queryName}`
    cacheInstance = new LocalStorageCache<T>(cacheKey)
  } else if (cache === 'sessionStorage') {
    const queryName = operationName ?? getQueryName(query)
    const cacheKey = `graphql:cache:${queryName}`
    cacheInstance = new SessionStorageCache<T>(cacheKey)
  }

  if (cacheInstance != null && !forceRefresh) {
    const cachedData = cacheInstance.get()
    if (cachedData != null) return cachedData
  }

  const response = await fetch(endpoint, {
    method: 'POST',
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

  if (cacheInstance != null) {
    cacheInstance.set({ maxAge, data })
  }

  return data
}
