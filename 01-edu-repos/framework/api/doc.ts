import type { Def, DefBase } from '@01edu/types/validator'
import type { GenericRoutes } from '@01edu/types/router'
import { route } from './router.ts'
import { ARR, BOOL, LIST, OBJ, optional, STR } from './validator.ts'

/**
 * Recursive type representing the structure of input/output documentation.
 * It mirrors the structure of the validator definitions but simplified for documentation purposes.
 */
export type Documentation =
  & (
    | { type: Exclude<DefBase['type'], 'object' | 'array' | 'list' | 'union'> }
    | { type: 'object'; properties: Record<string, Documentation> }
    | { type: 'array'; items: Documentation }
    | { type: 'list'; options: (string | number)[] }
    | { type: 'union'; options: Documentation[] }
  )
  & { description?: string; optional?: boolean }

/**
 * Represents the documentation for a single API endpoint.
 */
export type EndpointDoc = {
  method: string
  path: string
  requiresAuth: boolean
  authFunction: string
  description?: string
  input?: Documentation
  output?: Documentation
}

/**
 * Extracts documentation from a validator definition.
 * Recursively processes objects and arrays to build a `Documentation` structure.
 *
 * @param def - The validator definition to extract documentation from.
 * @returns The extracted documentation or undefined if no definition is provided.
 */
function extractDocs(def?: Def): Documentation | undefined {
  if (!def) return undefined
  const base = {
    type: def.type,
    description: def.description,
    optional: def.optional,
  }

  switch (def.type) {
    case 'object': {
      const properties: Record<string, Documentation> = {}
      for (const [key, value] of Object.entries(def.properties)) {
        const doc = extractDocs(value)
        if (doc) {
          properties[key] = doc
        }
      }
      return { ...base, properties, type: 'object' }
    }
    case 'array': {
      const items = extractDocs(def.of) as Documentation
      return { ...base, items, type: 'array' }
    }
    case 'list':
      return { ...base, options: def.of as (string | number)[], type: 'list' }
    case 'union':
      return {
        ...base,
        options: def.of.map((d: Def) => extractDocs(d) as Documentation),
        type: 'union',
      }
    case 'boolean':
      return { ...base, type: 'boolean' }
    case 'number':
      return { ...base, type: 'number' }
    case 'string':
      return { ...base, type: 'string' }
  }
}

/**
 * Generates API documentation for a set of routes.
 * Iterates through the route definitions and extracts metadata, input, and output documentation.
 *
 * @param defs - The route definitions to generate documentation for.
 * @returns An array of `EndpointDoc` objects describing the API.
 */
export const generateApiDocs = (defs: GenericRoutes) => {
  return Object.entries<typeof defs[keyof typeof defs]>(defs).map(
    ([key, handler]) => {
      const slashIndex = key.indexOf('/')
      const method = key.slice(0, slashIndex).toUpperCase()
      const path = key.slice(slashIndex)
      const requiresAuth = handler.authorize ? true : false

      return {
        method,
        path,
        requiresAuth,
        authFunction: handler.authorize?.name || '',
        description: 'description' in handler ? handler.description : undefined,
        input: 'input' in handler ? extractDocs(handler.input) : undefined,
        output: 'output' in handler ? extractDocs(handler.output) : undefined,
      }
    },
  )
}

const encoder = new TextEncoder()
const apiDocOutputDef: Def = ARR(
  OBJ({
    method: LIST(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 'HTTP method'),
    path: STR('API endpoint path'),
    requiresAuth: BOOL('whether authentication is required'),
    authFunction: STR('name of the authorization function'),
    description: STR('Endpoint description'),
    input: optional(OBJ({}, 'Input documentation structure')),
    output: optional(OBJ({}, 'Output documentation structure')),
  }, 'API documentation object structure'),
  'API documentation array',
)

/**
 * Creates a route handler that serves the generated API documentation.
 * The documentation is served as a JSON array of `EndpointDoc` objects.
 *
 * @param defs - The route definitions to generate documentation for.
 * @returns A route handler that serves the API documentation.
 */
export const createDocRoute = (defs: GenericRoutes) => {
  const docStr = JSON.stringify(generateApiDocs(defs))
  const docBuffer = encoder.encode(docStr)
  return route({
    fn: () =>
      new Response(docBuffer, {
        headers: { 'content-type': 'application/json' },
      }),
    output: apiDocOutputDef,
    description: 'Get the API documentation',
  })
}
