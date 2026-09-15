import type { Awaitable, IsUnknown, Nullish } from './mod.d.ts'
import type { Asserted, Def } from './validator.d.ts'
import type { RequestContext } from './context.d.ts'
/**
 * The supported HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
/**
 * A route pattern string, combining an HTTP method and a URL path.
 *
 * @example
 * ```
 * 'GET/users'
 * 'POST/users'
 * ```
 */
export type RoutePattern = `${HttpMethod}/${string}`

type RequestHandler = (
  ctx: RequestContext & { session: unknown },
) => Awaitable<Response>
type Respond<T> = Awaitable<T | Response>

type Authorized<Session> = IsUnknown<Session> extends true ? RequestContext
  : RequestContext & { session: Session }

/**
 * Descriptor for a handler that may authorize a session and convert input to output.
 *
 * In and Out are optional definitions (Def) or undefined. If `authorize` is provided,
 * its result will be passed as `Authorized<Session>` to `fn`.
 *
 * @template Session - session type produced by `authorize` and used in `fn`
 * @template In - input definition (Def) or undefined
 * @template Out - output definition (Def) or undefined
 */
export type Handler<
  Session,
  In extends Def | undefined,
  Out extends Def | undefined,
> = {
  input?: In
  output?: Out
  description?: string
  authorize?: (ctx: RequestContext, input: Asserted<In>) => Awaitable<Session>
  fn: (
    ctx: Authorized<Session>,
    input: Asserted<In>,
  ) => Respond<Asserted<Out>>
}
type Route = Record<HttpMethod, RequestHandler>
type SimpleHandler = (
  ctx: RequestContext,
  payload: unknown,
) => Respond<Nullish>

// deno-lint-ignore no-explicit-any
type ReservedRoutes<Session = any> = {
  /**
   * ⚠️ WARNING: You are overriding a default system route (Documentation).
   * @deprecated
   */
  'GET/api/doc'?: Handler<Session, Def | undefined, Def | undefined>

  /**
   * ⚠️ WARNING: You are overriding the system Health Check.
   * @deprecated
   */
  'GET/api/health'?: Handler<Session, Def | undefined, Def | undefined>

  /**
   * ⚠️ WARNING: You are overriding the system Dev SQL Execution route.
   * @deprecated
   */
  'POST/api/execute-sql'?: Handler<Session, Def | undefined, Def | undefined>
}

// deno-lint-ignore no-explicit-any
export type GenericRoutes<Session = any> =
  & Record<
    RoutePattern,
    Handler<Session, Def | undefined, Def | undefined>
  >
  & ReservedRoutes<Session>
