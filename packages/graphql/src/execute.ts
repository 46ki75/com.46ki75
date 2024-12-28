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

class SessionStorageCache<T> extends Cache<T> {
  /**
   * Remove the item from the cache
   */
  remove(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.key)
    }
  }

  /**
   *  Set the item in the cache
   * @param param0 The max age of the cache and the data to store
   */
  set({ maxAge, data }: { maxAge: number; data: T }): void {
    if (typeof window !== 'undefined') {
      const expires = new Date(Date.now() + maxAge)
      sessionStorage.setItem(this.key, JSON.stringify({ expires, data }))
    }
  }

  /**
   * Get the item from the cache
   * @returns The data from the cache or `undefined` if the cache is expired
   */
  get(): T | undefined {
    if (typeof window === 'undefined') {
      return undefined
    } else {
      const item = sessionStorage.getItem(this.key)

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
}

class LocalStorageCache<T> extends Cache<T> {
  /**
   * Remove the item from the cache
   */
  remove(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.key)
    }
  }

  /**
   *  Set the item in the cache
   * @param param0 The max age of the cache and the data to store
   */
  set({ maxAge, data }: { maxAge: number; data: T }): void {
    if (typeof window !== 'undefined') {
      const expires = new Date(Date.now() + maxAge)
      localStorage.setItem(this.key, JSON.stringify({ expires, data }))
    }
  }

  /**
   * Get the item from the cache
   * @returns The data from the cache or `undefined` if the cache is expired
   */
  get(): T | undefined {
    if (typeof window === 'undefined') {
      return undefined
    } else {
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
