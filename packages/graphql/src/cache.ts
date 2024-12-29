abstract class Cache<T> {
  public key: string

  constructor(key: string) {
    this.key = key
  }

  abstract remove(): void
  abstract set({ maxAge, data }: { maxAge: number; data: T }): void
  abstract get(): T | undefined
}

export class SessionStorageCache<T> extends Cache<T> {
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
   * @param param0.maxAge The max age of the cache [s]
   * @param param0.data The data to store
   */
  set({ maxAge, data }: { maxAge: number; data: T }): void {
    if (typeof window !== 'undefined') {
      const expires = new Date(Date.now() + maxAge * 1000)
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

export class LocalStorageCache<T> extends Cache<T> {
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
   * @param param0.maxAge The max age of the cache [s]
   * @param param0.data The data to store
   */
  set({ maxAge, data }: { maxAge: number; data: T }): void {
    if (typeof window !== 'undefined') {
      const expires = new Date(Date.now() + maxAge * 1000)
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
