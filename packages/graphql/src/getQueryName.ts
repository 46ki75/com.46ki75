import { parse, type DocumentNode, type OperationDefinitionNode } from 'graphql'

export function getQueryName(query: string): string | null {
  const ast: DocumentNode = parse(query)

  const operation = ast.definitions.find(
    (def): def is OperationDefinitionNode =>
      def.kind === 'OperationDefinition' && def.name?.value != null
  )

  return operation?.name?.value || null
}
