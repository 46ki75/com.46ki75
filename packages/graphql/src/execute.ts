import { getQueryName } from './getQueryName'

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
