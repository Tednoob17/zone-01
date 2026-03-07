/**
 * Type-safe HTTP Router module.
 *
 * Provides a mechanism to define HTTP routes with built-in support for:
 * - Input validation (via `input/output` schemas).
 * - Request Authorization (via `authorize` hooks).
 * - Automatic Response formatting.
 * - Export types for typed API client
 *
 * @module
 */

import type { Awaitable } from '@01edu/types'
import type { RequestContext } from '@01edu/types/context'
import type { Def } from '@01edu/types/validator'
import type {
  GenericRoutes,
  Handler,
  HttpMethod,
  Route,
  SimpleHandler,
} from '@01edu/types/router'
import type { Log } from './log.ts'
import { respond, ResponseError } from './response.ts'
import type { Sql } from '@01edu/types/db'
import { createSqlDevRoute } from './dev.ts'
import { createDocRoute } from './doc.ts'
import { createHealthRoute } from './health.ts'

/**
 * Options for configuring the router.
 */
export type RouterOptions = {
  log: Log
  sql?: Sql
  sensitiveKeys?: string[]
}

/**
 * A declaration function for creating a route handler.
 * This is primarily used for type inference and doesn't have any runtime logic.
 *
 * @param h - The route handler definition.
 * @returns The same handler definition.
 *
 * @example
 * ```ts
 * import { route } from '@01edu/router';
 * import { STR } from '@01edu/validator';
 *
 * const helloRoute = route({
 *   input: { name: STR() },
 *   output: { message: STR() },
 *   fn: (_, { name }) => ({ message: `Hello, ${name}!` }),
 * });
 * ```
 */
export const route = <
  Session,
  In extends Def | undefined,
  Out extends Def | undefined,
>(h: Handler<Session, In, Out>) => h

const getPayloadParams = (ctx: RequestContext) =>
  Object.fromEntries(ctx.url.searchParams)
const getPayloadBody = async (ctx: RequestContext) => {
  try {
    return await ctx.req.json()
  } catch {
    return {}
  }
}

const sensitiveData = (
  logPayload: unknown,
  sensitiveKeys: string[],
): Record<string, unknown> | undefined => {
  if (typeof logPayload !== 'object' || !logPayload) return
  let redactedPayload: Record<string, unknown> | undefined
  for (const key of sensitiveKeys) {
    if (key in logPayload) {
      redactedPayload || (redactedPayload = { ...logPayload })
      redactedPayload[key] = undefined
    }
  }
  return redactedPayload || (logPayload as Record<string, unknown>)
}

/**
 * Creates a router function from a set of route definitions.
 *
 * @param log - A logger instance.
 * @param defs - An object where keys are route patterns and values are route handlers.
 * @param sensitiveKeys - A list of keys to redact from logs.
 * @returns A router function that takes a `RequestContext` and returns a `Response`.
 *
 * @example
 * ```ts
 * import { makeRouter, route } from '@01edu/router';
 * import { logger } from '@01edu/log';
 * import { STR } from '@01edu/validator';
 *
 * const log = await logger({});
 * const routes = {
 *   'GET/hello': route({
 *     input: { name: STR() },
 *     output: { message: STR() },
 *     fn: (_, { name }) => ({ message: `Hello, ${name}!` }),
 *   }),
 * };
 *
 * const router = makeRouter(routes, { log });
 * ```
 */
export const makeRouter = <T extends GenericRoutes>(
  defs: T,
  {
    log,
    sql,
    sensitiveKeys = [
      'password',
      'confPassword',
      'currentPassword',
      'newPassword',
    ],
  }: RouterOptions,
): (ctx: RequestContext) => Awaitable<Response> => {
  const routeMaps: Record<string, Route> = Object.create(null)

  if (!defs['POST/api/execute-sql']) {
    defs['POST/api/execute-sql'] = createSqlDevRoute(sql)
  }

  if (!defs['GET/api/doc']) {
    defs['GET/api/doc'] = createDocRoute(defs)
  }

  if (!defs['GET/api/health']) {
    defs['GET/api/health'] = createHealthRoute()
  }

  for (const key in defs) {
    const slashIndex = key.indexOf('/')
    const method = key.slice(0, slashIndex) as HttpMethod
    const url = key.slice(slashIndex)
    if (!routeMaps[url]) {
      routeMaps[url] = Object.create(null) as Route
      routeMaps[`${url}/`] = routeMaps[url]
    }
    const { fn, input, authorize } = defs[key] as Handler<unknown, Def, Def>
    const handler = async (
      ctx: RequestContext & { session: unknown },
      payload?: unknown,
    ) => {
      try {
        ctx.session = await authorize?.(ctx, payload)
      } catch (err) {
        if (err instanceof ResponseError) throw err
        const message = err instanceof Error ? err.message : 'Unauthorized'
        return respond.Unauthorized({ message })
      }
      const result = await (fn as SimpleHandler)(ctx, payload)
      if (result == null) return respond.NoContent()
      return result instanceof Response ? result : respond.OK(result)
    }
    if (input) {
      const getPayload = method === 'GET' ? getPayloadParams : getPayloadBody
      const assert = input.assert
      const report = input.report || (() => [`Expect a ${input?.type}`])
      routeMaps[url][method] = async (
        ctx: RequestContext & { session: unknown },
      ) => {
        const payload = await getPayload(ctx)
        let asserted
        try {
          asserted = assert(payload)
        } catch {
          const message = 'Input validation failed'
          const failures = report(payload)
          return respond.BadRequest({ message, failures })
        }
        try {
          ctx.session = await authorize?.(ctx, payload)
        } catch (err) {
          if (err instanceof ResponseError) throw err
          const message = err instanceof Error ? err.message : 'Unauthorized'
          return respond.Unauthorized({ message })
        }

        log.info('in-params', sensitiveData(asserted, sensitiveKeys))
        return handler(ctx, asserted)
      }
    } else {
      routeMaps[url][method] = handler
    }
  }

  return (ctx: RequestContext) => {
    const route = routeMaps[ctx.url.pathname]
    if (!route) return respond.NotFound()
    const handler = route[ctx.req.method as HttpMethod]
    if (!handler) return respond.MethodNotAllowed()
    return handler(ctx as RequestContext & { session: unknown })
  }
}
