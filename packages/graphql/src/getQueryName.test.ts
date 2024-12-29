import { getQueryName } from './getQueryName.js'
import { test, expect } from 'vitest'

test('getQueryName', () => {
  const query = /* GraphQL */ `
    query GetPerson {
      person {
        name
      }
    }
  `

  const queryName = getQueryName(query)
  expect(queryName).toBe('GetPerson')
})

test('getQueryName with no name', () => {
  const query = /* GraphQL */ `
    query {
      person {
        name
      }
    }
  `

  const queryName = getQueryName(query)
  expect(queryName).toBe(null)
})

test('getMutationName', () => {
  const query = /* GraphQL */ `
    mutation CreatePerson {
      createPerson {
        name
      }
    }
  `

  const queryName = getQueryName(query)
  expect(queryName).toBe('CreatePerson')
})
