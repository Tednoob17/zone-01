/**
 * Type-safe HTTP API Client.
 *
 * Builds a strongly-typed client from server route definitions. For each
 * declared route it provides:
 * - fetch(input?, options?): Promise<Output>
 * - signal(): a reactive RequestState wrapper powered by @preact/signals
 *
 * Features:
 * - End-to-end input/output typing from your route defs
 * - Abortable requests with `.reset()` and deduping via a shared AbortController
 * - Helpful errors: `ErrorWithData` (JSON error payload) and `ErrorWithBody` (invalid JSON)
 *
 * @example Basic usage
 * ```ts
 * import { makeClient } from '@01edu/api-client'
 * import type { RoutesDefinitions } from '/api/routes.ts'
 * // Important, only import types from your backend
 *
 * const api = makeClient<RoutesDefinitions>('/api')
 * const res = await api['GET/hello'].fetch({ name: 'Ada' })
 * ```
 *
 * @example Reactive usage
 * ```ts
 * const hello = api['GET/hello'].signal()
 * hello.fetch({ name: 'Ada' })
 * hello.$.subscribe(v => console.log(v.pending, v.data, v.error))
 * ```
 *
 * @module
 */
import { Signal } from '@preact/signals'
import type { Asserted } from '@01edu/types/validator'
import type { GenericRoutes, Handler, HttpMethod } from '@01edu/types/router'

/**
 * Error thrown when the server returns a JSON error payload.
 * The parsed error metadata is available on `data`.
 *
 * @example
 * ```ts
 * try {
 *   await api['POST/login'].fetch({ user, pass });
 * } catch (e) {
 *   if (e instanceof ErrorWithData) {
 *     console.error(e.message, e.data);
 *   }
 * }
 * ```
 */
export class ErrorWithData extends Error {
  public data: Record<string, unknown>
  constructor(message: string, data: Record<string, unknown>) {
    super(message)
    this.name = 'ErrorWithData'
    this.data = data
  }
}

/**
 * Error thrown when the response body cannot be parsed as JSON.
 * The raw body is available on `body`, and extra context on `data`.
 *
 * @example
 * ```ts
 * try {
 *   await api['GET/debug'].fetch();
 * } catch (e) {
 *   if (e instanceof ErrorWithBody) {
 *     console.error('Invalid JSON:', e.body, e.data);
 *   }
 * }
 * ```
 */
export class ErrorWithBody extends ErrorWithData {
  public body: string
  constructor(body: string, data: Record<string, unknown>) {
    super('Failed to parse body', data)
    this.name = 'ErrorWithBody'
    this.body = body
  }
}

// I made the other field always explicitly undefined and optional
// this way we do not have to check all the time that they exists
type RequestState<T> =
  | {
    data: T
    pending?: undefined
    promise?: undefined
    controller?: undefined
    error?: undefined
    at: number
  }
  | {
    data?: T | undefined
    pending: number
    promise?: Promise<T>
    controller?: AbortController
    error?: undefined
    at?: number
  }
  | {
    data?: T | undefined
    pending?: undefined
    promise?: undefined
    controller?: undefined
    error: ErrorWithBody | ErrorWithData | Error
    at: number
  }

type ReplacerType = (key: string, value: unknown) => unknown

type Options = {
  headers?: HeadersInit
  signal?: AbortSignal
  replacer?: ReplacerType
}

const withoutBody = new Set([
  204, // NoContent
  205, // ResetContent
  304, // NotModified
])

type HandlerIO<T, K extends keyof T> = T[K] extends // deno-lint-ignore no-explicit-any
Handler<any, infer TInput, infer TOutput>
  ? [Asserted<TInput>, Asserted<TOutput>]
  : never

/**
 * Creates a typed API client from a `GenericRoutes` declaration.
 *
 * Each route key maps to:
 * - `fetch(input?, options?)`: Promise<Output>
 * - `signal()`: reactive RequestState with `$.value`, `fetch`, `reset`, and getters
 *
 * @param baseUrl - Optional prefix applied to every route path (e.g. `/api`).
 * @returns A proxy object keyed by route pattern, exposing typed `fetch` and `signal` helpers.
 *
 * @example
 * ```ts
 * import { makeClient } from '@01edu/api-client'
 * import type { RouteDefinitions } from '/api/routes.ts'
 *
 * const api = makeClient<RouteDefinitions>('/api')
 *
 * // One-shot call
 * const result = await api['GET/hello'].fetch({ name: 'Ada' })
 *
 * // Reactive usage
 * const hello = api['GET/hello'].signal()
 * hello.fetch({ name: 'Ada' })
 * hello.$.subscribe(v => console.log(v.pending, v.data, v.error))
 * ```
 */
export const makeClient = <T extends GenericRoutes>(baseUrl = ''): {
  [K in keyof T]: {
    fetch: (
      input?: HandlerIO<T, K>[0] | undefined,
      options?: Options | undefined,
    ) => Promise<HandlerIO<T, K>[1]>
    signal: (
      options?: { replacer?: ReplacerType },
    ) => RequestState<HandlerIO<T, K>[1]> & {
      $: Signal<RequestState<HandlerIO<T, K>[1]>>
      reset: () => void
      fetch: (
        input?: HandlerIO<T, K>[0] | undefined,
        headers?: HeadersInit | undefined,
      ) => Promise<void>
      at: number
    }
  }
} => {
  function makeClientCall<K extends keyof T>(urlKey: K) {
    type IO = HandlerIO<T, K>
    type Input = IO[0]
    type Output = IO[1]
    const key = urlKey as string
    const slashIndex = key.indexOf('/')
    const method = key.slice(0, slashIndex) as HttpMethod
    const path = key.slice(slashIndex)
    const defaultHeaders = { 'Content-Type': 'application/json' }

    async function fetcher(input?: Input, options?: Options | undefined) {
      const { replacer, ...fetchOptions } = options || {}
      let url = `${baseUrl}${path}`
      let headers = options?.headers
      if (!headers) {
        headers = defaultHeaders
      } else {
        headers instanceof Headers || (headers = new Headers(headers))
        for (const [key, value] of Object.entries(defaultHeaders)) {
          headers.set(key, value)
        }
      }

      let bodyInput: string | undefined = undefined
      if (input) {
        method === 'GET'
          ? (url += `?${new URLSearchParams(input as Record<string, string>)}`)
          : (bodyInput = JSON.stringify(input))
      }

      const response = await fetch(
        url,
        { ...fetchOptions, method, headers, body: bodyInput },
      )
      if (withoutBody.has(response.status)) return null as unknown as Output
      const body = await response.text()
      let payload
      const contentType = response.headers.get('content-type')
      try {
        payload = contentType?.includes('application/json')
          ? JSON.parse(body, replacer)
          : body
        if (response.ok) return payload as Output
      } catch {
        throw new ErrorWithBody(body, { response })
      }
      const { message, ...data } = payload
      throw new ErrorWithData(message, data)
    }

    const signal = (options: { replacer?: ReplacerType } = {}) => {
      const $ = new Signal<RequestState<Output>>({ pending: 0 })
      return {
        $,
        reset: () => {
          $.peek().controller?.abort()
          $.value = { pending: 0 }
        },
        fetch: async (input, headers) => {
          const prev = $.peek()
          try {
            const controller = new AbortController()
            prev.controller?.abort()
            const { replacer } = options
            const { signal } = controller
            const promise = fetcher(input, {
              replacer,
              signal,
              headers,
            })
            $.value = {
              pending: Date.now(),
              promise,
              controller,
              data: prev.data,
            }
            $.value = {
              data: await promise,
              at: Date.now(),
            }
          } catch (err) {
            $.value = (err instanceof DOMException && err.name === 'AbortError')
              ? { pending: 0, data: prev.data }
              : {
                error: err as (ErrorWithBody | ErrorWithData | Error),
                data: prev.data,
                at: Date.now(),
              }
          }
        },
        get data() {
          return $.value.data
        },
        get error() {
          return $.value.error
        },
        get pending() {
          return $.value.pending
        },
        get at() {
          return $.value.at ?? 0
        },
      } as RequestState<Output> & {
        $: Signal<RequestState<Output>>
        reset: () => void
        fetch: (
          input?: Input,
          headers?: HeadersInit | undefined,
        ) => Promise<void>
        at: number
      }
    }

    return { fetch: fetcher, signal }
  }

  const client = {} as { [K in keyof T]: ReturnType<typeof makeClientCall<K>> }
  const lazy = (k: keyof T) => client[k] || (client[k] = makeClientCall(k))
  return new Proxy(client, {
    get: (_, key: string) => lazy(key as keyof T),
  })
}
