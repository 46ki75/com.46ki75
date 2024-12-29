import { describe, expect, test } from 'vitest'
import { execute } from './execute'

describe('execute function', async () => {
  test('simple query', async () => {
    const query = /* GraphQL */ `
      query ListContinents {
        continents {
          name
        }
      }
    `

    type Response = { continents: Array<{ name: string }> }

    const result = await execute<Response>({
      endpoint: 'https://countries.trevorblades.com/',
      query
    })

    console.log(result)

    expect(result.continents).toHaveLength(7)

    const continents = [
      'Africa',
      'Antarctica',
      'Asia',
      'Europe',
      'North America',
      'Oceania',
      'South America'
    ]

    continents.forEach((continent) => {
      expect(
        result.continents.some(({ name }) => name === continent)
      ).toBeTruthy()
    })
  })
})
