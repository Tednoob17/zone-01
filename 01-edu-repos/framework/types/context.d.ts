/**
 * Represents the context for a single HTTP request.
 * It holds all relevant information for the request lifecycle.
 */
export type RequestContext = {
  /** The original, immutable Request object. */
  readonly req: Readonly<Request>
  /** The parsed URL of the request. */
  readonly url: Readonly<URL>
  /** A key-value store of cookies sent with the request. */
  readonly cookies: Readonly<Record<string, string>>
  /** A unique identifier for tracing the request through the system. */
  readonly trace: number
  /** An optional identifier for a specific span within a trace, for more granular performance monitoring. */
  readonly span: number | undefined
}

/**
 * A function that returns the current request's context.
 *
 * @example
 * ```ts
 * import { getContext } from '@01edu/context';
 *
 * const context = getContext();
 * console.log(context.url.pathname);
 * ```
 */
export type GetContext = () => RequestContext
/**
 * A function that creates a new request context. Useful for testing or running background jobs.
 *
 * @example
 * ```ts
 * import { newContext } from '@01edu/context';
 *
 * const context = newContext('/users/123');
 * console.log(context.url.pathname);
 * ```
 */
export type NewContext = (
  urlInit: string | URL,
  extra?: Partial<RequestContext>,
) => RequestContext

/**
 * A function that runs a callback within a specific request context.
 * This is the foundation of how the context is managed across asynchronous operations.
 *
 * @example
 * ```ts
 * import { runContext, newContext } from '@01edu/context';
 *
 * const context = newContext('/');
 * runContext(context, () => {
 *   // all code here will have access to `context` via `getContext()`
 * });
 * ```
 */
export type RunContext = <X = unknown>(
  store: RequestContext,
  cb: (store: RequestContext) => X,
) => X
