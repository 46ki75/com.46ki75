import { parse, type DocumentNode, type OperationDefinitionNode } from 'graphql'

/**
 * Get the name of the query from the query string.
 * This function cloud be used to get the name of the query or mutation.
 *
 * If the query has no name, it will return `null`.
 *
 * @param query The query string
 * @returns The name of the query or `null` if the query has no name
 */
export function getQueryName(query: string): string | null {
  const ast: DocumentNode = parse(query)

  const operation = ast.definitions.find(
    (def): def is OperationDefinitionNode =>
      def.kind === 'OperationDefinition' && def.name?.value != null
  )

  return operation?.name?.value || null
}
