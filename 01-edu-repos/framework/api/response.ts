/**
 * Set of simple shortcuts for creating standard JSON web responses
 * for every HTTP status code, like respond.OK() or respond.NotFound().
 * It also automatically creates corresponding error classes for HTTP errors,
 * so you can easily throw a NotFoundError in your code.
 * This interact with our provided server to allow errors that can be used
 * by both application code and to build http response.
 * @module
 */

import { STATUS_CODE, STATUS_TEXT } from '@std/http/status'

const defaultHeaderEntries: [string, string][] = [
  ['content-type', 'application/json'],
]

const defaultHeaders = new Headers(defaultHeaderEntries)

const json = (data?: unknown, init?: ResponseInit) => {
  if (data == null) return new Response(null, init)
  if (!init) {
    init = { headers: defaultHeaders }
  } else if (!init.headers) {
    init.headers = defaultHeaders
  } else {
    if (!(init.headers instanceof Headers)) {
      init.headers = new Headers(init.headers)
    }
    const h = init.headers as Headers
    for (const entry of defaultHeaderEntries) {
      h.set(entry[0], entry[1])
    }
  }

  return new Response(JSON.stringify(data), init)
}

/**
 * A custom error class that encapsulates a `Response` object.
 * This is the base class for all HTTP errors created by the `respond` object.
 *
 * @example
 * ```ts
 * import { ResponseError, respond } from '@01edu/response';
 *
 * try {
 *   throw new respond.NotFoundError({ message: 'User not found' });
 * } catch (e) {
 *   if (e instanceof ResponseError) {
 *     // e.response is a Response object
 *   }
 * }
 * ```
 */
export class ResponseError extends Error {
  /** The `Response` object associated with the error. */
  public response: Response

  constructor(message: string, response: Response) {
    super(message)
    this.name = 'ResponseError'
    this.response = response
  }
}

type StatusCodeWithoutBody =
  | 'Continue'
  | 'SwitchingProtocols'
  | 'Processing'
  | 'EarlyHints'
  | 'NoContent'
  | 'ResetContent'
  | 'NotModified'

const withoutBody = new Set([
  100, // Continue
  101, // SwitchingProtocols
  102, // Processing
  103, // EarlyHints
  204, // NoContent
  205, // ResetContent
  304, // NotModified
])

type StatusNotErrors =
  | 'OK'
  | 'Created'
  | 'Accepted'
  | 'NonAuthoritativeInfo'
  | 'NoContent'
  | 'ResetContent'
  | 'PartialContent'
  | 'MultiStatus'
  | 'AlreadyReported'
  | 'IMUsed'
  | 'MultipleChoices'
  | 'MovedPermanently'
  | 'Found'
  | 'SeeOther'
  | 'NotModified'
  | 'UseProxy'
  | 'TemporaryRedirect'
  | 'PermanentRedirect'

const notErrors = new Set([
  200, // OK
  201, // Created
  202, // Accepted
  203, // NonAuthoritativeInfo
  204, // NoContent
  205, // ResetContent
  206, // PartialContent
  207, // MultiStatus
  208, // AlreadyReported
  226, // IMUsed
  300, // MultipleChoices
  301, // MovedPermanently
  302, // Found
  303, // SeeOther
  304, // NotModified
  305, // UseProxy
  307, // TemporaryRedirect
  308, // PermanentRedirect
])

type ErrorStatus = Exclude<
  Exclude<keyof typeof STATUS_CODE, StatusCodeWithoutBody>,
  StatusNotErrors
>

/**
 * A collection of utility functions and error classes for creating standard `Response` objects.
 *
 * - For each HTTP status code, there is a corresponding function (e.g., `respond.OK()`, `respond.NotFound()`).
 * - For HTTP error status codes, there is a corresponding error class (e.g., `respond.NotFoundError`).
 *
 * @example
 * ```ts
 * import { respond } from '@01edu/response';
 *
 * // Create a 200 OK response with a JSON body
 * const okResponse = respond.OK({ message: 'Success!' });
 *
 * // Create a 404 Not Found response
 * const notFoundResponse = respond.NotFound();
 *
 * // Throw a 400 Bad Request error
 * throw new respond.BadRequestError({ error: 'Invalid input' });
 * ```
 */
export const respond = Object.fromEntries([
  ...Object.entries(STATUS_CODE).map(([key, status]) => {
    const statusText = STATUS_TEXT[status]
    const defaultData = new TextEncoder().encode(
      JSON.stringify({ message: statusText }) + '\n',
    )

    const makeResponse = withoutBody.has(status)
      ? (headers?: HeadersInit) =>
        headers === undefined
          ? json(null, { headers: defaultHeaders, status, statusText })
          : json(null, { headers, status, statusText })
      : (data?: unknown, headers?: HeadersInit) =>
        data === undefined
          ? new Response(defaultData, {
            headers: defaultHeaders,
            status,
            statusText,
          })
          : json(data, { headers, status, statusText })

    return [key, makeResponse]
  }),

  ...Object.entries(STATUS_CODE)
    .filter(([_, status]) => !withoutBody.has(status) && !notErrors.has(status))
    .map(([key, status]) => {
      const statusText = STATUS_TEXT[status]
      const name = `${key}Error`
      return [
        name,
        class extends ResponseError {
          constructor(data?: unknown, headers?: HeadersInit) {
            super(statusText, respond[key as ErrorStatus](data, headers))
            this.name = name
          }
        },
      ]
    }),
  ['ResponseError', ResponseError],
]) as (
  & {
    [k in Exclude<keyof typeof STATUS_CODE, StatusCodeWithoutBody>]: (
      data?: unknown,
      headers?: HeadersInit,
    ) => Response
  }
  & {
    [k in Extract<keyof typeof STATUS_CODE, StatusCodeWithoutBody>]: (
      headers?: HeadersInit,
    ) => Response
  }
  & {
    [
      k in `${Exclude<
        Exclude<keyof typeof STATUS_CODE, StatusCodeWithoutBody>,
        StatusNotErrors
      >}Error`
    ]: new (data?: unknown, headers?: HeadersInit) => ResponseError
  }
  & { ResponseError: typeof ResponseError }
)
