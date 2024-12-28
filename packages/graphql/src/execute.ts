import { getQueryName } from './getQueryName'

abstract class Cache<T> {
  public key: string

  constructor(key: string) {
    this.key = key
  }

  abstract remove(): void
  abstract set({ maxAge, data }: { maxAge: number; data: T }): void
  abstract get(): T | undefined
}

class LocalStorageCache<T> extends Cache<T> {
  /**
   * Remove the item from the cache
   */
  remove(): void {
    localStorage.removeItem(this.key)
  }

  /**
   *  Set the item in the cache
   * @param param0 The max age of the cache and the data to store
   */
  set({ maxAge, data }: { maxAge: number; data: T }) {
    const expires = new Date(Date.now() + maxAge)

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify({ expires, data }))
    }
  }

  /**
   * Get the item from the cache
   * @returns The data from the cache or `undefined` if the cache is expired
   */
  get(): T | undefined {
    const item = localStorage.getItem(this.key)

    if (item == null) return undefined

    const cache: {
      expires: string
      data: T
    } = JSON.parse(item)

    if (new Date(cache.expires) < new Date()) {
      this.remove()
      return undefined
    }

    return cache.data
  }
}

export async function execute<T>({
  endpoint,
  query,
  variables,
  headers
}: {
  endpoint: string
  query: string
  variables?: Record<string, any>
  headers?: Record<string, string>
}): Promise<T> {
  const queryName = getQueryName(query)
  const cacheKey = `graphql:cache:${queryName}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ query, variables })
  })

  const { data, errors }: { data: T; errors: any } = await response.json()

  return data
}
