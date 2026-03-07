/** @jsxImportSource preact */

/**
 * SPA routing helpers that treat the URL as storage, built on @preact/signals.
 *
 * Behavior:
 * - Trailing slashes are normalized (`/users/` → `/users`)
 * - Query parameter order is ignored for equality
 * - External links and `/api/*` fall back to normal navigation
 *
 * @example Quick start
 * ```tsx
 * import { A, url, navigate, replaceParams } from '@01edu/router-signal';
 *
 * // Read without new signals/hooks
 * if (url.path === '/users') { /* ... *\/ }
 * const page = url.params.page; // "2" | null
 *
 * // Navigate declaratively
 * <A href="/users" params={{ page: 2 }}>Users page 2</A>
 *
 * // Navigate imperatively
 * navigate({ href: '/users', params: { tab: 'active' } });
 *
 * // Replace all query params
 * navigate({ params: replaceParams({ page: 1, filter: true }) });
 * ```
 *
 * @module
 */

import type {
  HTMLAttributes,
  JSX,
  TargetedMouseEvent,
  TargetedPointerEvent,
} from 'preact'
import { computed, Signal } from '@preact/signals'

const isCurrentURL = (alt: URL) => {
  const url = urlSignal.value
  if (url.href === alt.href) return true
  if (url.origin !== alt.origin) return false
  if (url.pathname !== alt.pathname) return false
  // handle special case, same params but different order.
  // must still be equal
  if (alt.searchParams.size !== url.searchParams.size) return false
  if (alt.searchParams.size === 0) return true // no params -> same url
  // both urls have the same numbers of params, now let's confirm they are
  // all the same values
  for (const [k, v] of alt.searchParams) {
    if (url.searchParams.get(k) !== v) return false
  }
  return true
}

const baseURL = new URL(document.baseURI)

// ensure we never have trailing /
const initialUrl = new URL(location.href)
if (location.pathname.at(-1) === '/') {
  initialUrl.pathname = initialUrl.pathname.slice(0, -1)
  history.replaceState({}, '', initialUrl.href)
}

const urlSignal = new Signal(initialUrl)
const { origin } = initialUrl

const dispatchNavigation = () => {
  // If the path did change, we update the local state and trigger the change
  const url = new URL(location.href)
  url.pathname.at(-1) === '/' && (url.pathname = url.pathname.slice(0, -1))
  if (isCurrentURL(url)) return
  urlSignal.value = url
}

addEventListener('popstate', dispatchNavigation)
addEventListener('hashchange', dispatchNavigation)

const navigateUrl = (to: string, replace = false) => {
  history[replace ? 'replaceState' : 'pushState']({}, '', to)
  dispatchNavigation()
}

type ParamPrimitive = string | number | null | undefined
type ParamValue = ParamPrimitive | boolean | ParamPrimitive[]
type Params = Record<string, ParamValue>
type GetUrlProps = {
  href?: string
  hash?: string
  params?: URLSearchParams | Params
}

const getUrl = ({ href, hash, params }: GetUrlProps): URL => {
  const currentUrl = urlSignal.value
  const url = new URL(href || currentUrl, baseURL.href)
  hash != null && (url.hash = hash)
  url.pathname.at(-1) === '/' && (url.pathname = url.pathname.slice(0, -1))
  if (!params) {
    if (url.pathname !== currentUrl.pathname) return url
    url.search = `?${currentUrl.searchParams}`
    return url
  }
  for (const [key, value] of Object.entries(params) as [string, ParamValue][]) {
    if (Array.isArray(value)) {
      // Remove existing then append each to preserve ordering
      url.searchParams.delete(key)
      for (const v of value) {
        if (v == null) continue // skip deletions inside arrays
        url.searchParams.append(key, String(v))
      }
      continue
    }
    if (value === true) {
      url.searchParams.set(key, '')
    } else if (value === false || value == null) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

/**
 * Programmatic client-side navigation.
 *
 * Builds a URL from `href`, `hash`, and `params` then navigates to it.
 * If `replace` is true, uses history.replaceState; otherwise pushState.
 *
 * Example:
 * ```ts
 * // Navigate to /users?tab=active
 * navigate({ href: '/users', params: { tab: 'active' } })
 *
 * // Replace current entry and set a hash
 * navigate({ hash: 'details', replace: true })
 * ```
 */
export const navigate = (props: GetUrlProps & { replace?: boolean }): void =>
  navigateUrl(getUrl(props).href, props.replace)

/**
 * Props for the `<A>` component.
 *
 * - `href` - target path or absolute/relative URL
 * - `hash` - fragment without leading `#`
 * - `params` - query parameters to merge into the URL
 * - `replace` - use history.replaceState instead of pushState
 * - Plus all standard anchor attributes from Preact.
 */
export type LinkProps =
  & { replace?: boolean }
  & HTMLAttributes<HTMLAnchorElement>
  & GetUrlProps

const handleNavigation = (
  event:
    | TargetedPointerEvent<HTMLAnchorElement>
    | TargetedMouseEvent<HTMLAnchorElement>,
  url: URL,
  replace?: boolean,
): void => {
  // We don't want to skip if it's a special click
  // that would break the default browser behaviour
  const shouldSkip = event.defaultPrevented ||
    event.button ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey

  if (shouldSkip) return

  // In the normal case we handle the routing internally
  event.preventDefault()
  navigateUrl(url.href, replace)
}
/**
 * A typed anchor component with client-side routing.
 *
 * - Performs SPA navigation for same-origin, non-/api paths
 * - Falls back to a normal anchor for external links or `/api/*`
 * - Uses `onPointerDown` for snappy navigation while preserving default
 *   browser behavior on modified clicks (cmd/ctrl/shift, middle-click).
 *
 * Example:
 * ```tsx
 * <A href="/users" params={{ page: 2 }}>Users</A>
 * <A href="https://example.com">External</A>
 * <A href="/api/users">Server route (no SPA)</A>
 * ```
 */
export const A = ({
  href,
  hash,
  params,
  replace,
  onClick,
  onPointerDown,
  ...props
}: LinkProps): JSX.Element => {
  const url = getUrl({ href, hash, params })
  const noRouting = url.origin !== origin ||
    url.pathname.startsWith('/api/')

  if (noRouting) {
    return (
      <a
        href={url.href}
        onClick={onClick}
        onPointerDown={onPointerDown}
        {...props}
      />
    )
  }

  return (
    <a
      href={url.href}
      onPointerDown={(event) => {
        typeof onPointerDown === 'function' && onPointerDown(event)
        handleNavigation(event, url, replace)
      }}
      onClick={(event) => {
        typeof onClick === 'function' && onClick(event)
        const notMouse = event.clientX === 0 && event.clientY === 0
        notMouse
          ? handleNavigation(event, url, replace)
          : event.preventDefault()
      }}
      {...props}
    />
  )
}

const toDeletedParam = (k: string) => [k, null]
// Only update if the key changes
const paramKeys = computed(() =>
  urlSignal.value.searchParams.keys().toArray().sort().join('&')
)
const emptyParams = computed<Record<string, null>>(() =>
  Object.fromEntries(paramKeys.value.split('&').map(toDeletedParam))
)

/**
 * Merges a new set of query parameters, replacing existing ones.
 *
 * Returns an object suitable for the `params` prop or `navigate({ params })`.
 * Existing query keys are cleared, then `newParams` are applied:
 * - true -> present as key with empty value (?key)
 * - false or null/undefined -> removed
 * - string | number | boolean -> set as value
 *
 * Example:
 * ```ts
 * // Replace all params with ?page=2&filter
 * navigate({ params: replaceParams({ page: 2, filter: true }) })
 * ```
 */
export const replaceParams = (newParams?: Params): Params => ({
  ...emptyParams.value,
  ...newParams,
})

// wrap params behind a proxy to allow accessing
const params = new Proxy({} as Record<string, Signal<string | null>>, {
  // this allow enumeration to work, so Object.keys(), {...params} will work
  ownKeys: () => [...urlSignal.value.searchParams.keys()],
  getOwnPropertyDescriptor: (_, key) => ({
    enumerable: true,
    configurable: true,
    value: urlSignal.value.searchParams.get(key as string),
  }),

  // this is when we get a single key
  get: (cache, key) =>
    (typeof key !== 'string' || !key) ? null : (cache[key] || (
      cache[key] = computed(() => urlSignal.value.searchParams.get(key))
    )).value,
}) as unknown as Record<string, string | null>

// http://localhost:8000/user/settings?id=454&options=open#display
// url.path: 'user/settings'
// url.hash: 'display'
// url.params: { id: 454, option: 'open' }
const hashSignal = computed(() => urlSignal.value.hash)
const pathSignal = computed(() => urlSignal.value.pathname)
const matchPath = (path: string) =>
  `${baseURL.pathname}${path}` === `${pathSignal.value}`

const relativePath = computed(() => {
  const path = pathSignal.value
  const base = baseURL.pathname.replace(/\/$/, '')
  if (!path.startsWith(base)) return path
  return path.slice(base.length) || '/'
})
/**
 * Reactive URL helpers.
 *
 * - path: current pathname without trailing slash
 * - hash: current hash (including leading '#')
 * - value: current URL value, like a normal signal
 * - peek: return the value without registering the signal
 * - params: proxy for query params; read keys as string|null, enumerable
 * - equals(url): compare with a URL object; same-origin and same query values
 *
 * Example:
 * ```ts
 * if (url.path === '/users') { /* ... *\/ }
 * console.log(url.params.page) // "2" | null
 * url.equals(new URL('/users?page=2', location.origin))
 * ```
 */
export const url: {
  path: string
  hash: string
  value: URL
  peek: () => URL
  params: Record<string, string | null>
  equals: (url: URL) => boolean
  base: URL
  relativePath: string
  matchPath: (...paths: string[]) => boolean
} = {
  base: baseURL,
  get relativePath() {
    return relativePath.value
  },
  matchPath(...paths: string[]) {
    return paths.some(matchPath)
  },
  get path() {
    return pathSignal.value
  },
  get hash() {
    return hashSignal.value
  },
  get value() {
    return urlSignal.value
  },
  peek() {
    return urlSignal.peek()
  },
  params,
  equals: (url: URL) => isCurrentURL(url),
}
