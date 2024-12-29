/**
 * @vitest-environment jsdom
 * @see https://vitest.dev/config/#environment
 */

import { expect, test } from 'vitest'
import { LocalStorageCache, SessionStorageCache } from './cache'
import { describe } from 'node:test'

describe('LocalStorageCache', async () => {
  test('Set and Get', async () => {
    type Data = { keyA: number; keyB: string; keyC: boolean }
    const data = { keyA: 1, keyB: 'test', keyC: true }

    const cache = new LocalStorageCache<Data>('LocalStorageCache:Set and Get')
    cache.set({ maxAge: 1000, data })

    expect(cache.get()).toEqual(data)
  })

  test('Get expired', async () => {
    type Data = { keyA: number; keyB: string; keyC: boolean }
    const data = { keyA: 1, keyB: 'test', keyC: true }

    const cache = new LocalStorageCache<Data>('LocalStorageCache:Get expired')
    cache.set({ maxAge: -1, data })

    expect(cache.get()).toEqual(undefined)
  })
})

describe('SessionStorageCache', async () => {
  test('Set and Get', async () => {
    type Data = { keyA: number; keyB: string; keyC: boolean }
    const data = { keyA: 1, keyB: 'test', keyC: true }

    const cache = new SessionStorageCache<Data>('LocalStorageCache:Set and Get')
    cache.set({ maxAge: 1000, data })

    expect(cache.get()).toEqual(data)
  })

  test('Get expired', async () => {
    type Data = { keyA: number; keyB: string; keyC: boolean }
    const data = { keyA: 1, keyB: 'test', keyC: true }

    const cache = new SessionStorageCache<Data>('LocalStorageCache:Get expired')
    cache.set({ maxAge: -1, data })

    expect(cache.get()).toEqual(undefined)
  })
})
