# @01edu/router-signal

Tiny SPA routing helpers built on top of @preact/signals that treat the URL as
your application state.

## Why URL as storage

Using the URL as the single source of truth gives you, for free:

- Shareable and bookmarkable state: copy the URL to reproduce the exact view and
  filters.
- Native navigation: back/forward buttons, reload, and deep links just work.
- Durable state: survives reloads and tab restores.
- Zero extra state containers: no bespoke stores, reducers, or custom hooks.
- Observable with minimal invalidation: we expose simple reads backed by
  computed signals; you don’t author new signals.

This package embraces that: it exposes just a few primitives that read/write the
URL and let the browser do the rest.

## What you get

- `A` — a typed anchor that performs client-side navigation for same-origin
  paths
- `navigate` — programmatic navigation using `history.pushState`/`replaceState`
- `replaceParams` — rebuild query strings in a predictable way
- `url` — reactive, read-only helpers: `path`, `hash`, `params`, `equals`

Trailing slashes are normalized away (`/users/` → `/users`), and query parameter
order doesn’t matter when comparing URLs.

## Quick start

Use the `A` component instead of anchors. It preserves all native behaviors
(open in new tab, copy link address, etc.) and does SPA navigation for
same-origin, non-`/api/*` URLs.

```tsx
import { A } from '@01edu/router-signal'

export function Nav() {
  return (
    <nav>
      <A href='/'>Home</A>
      <A href='/users' params={{ page: 2 }}>Users (page 2)</A>
      <A href='https://example.com'>External (normal link)</A>
    </nav>
  )
}
```

Programmatic navigation:

> Always prefer using an `A` over a `navigate`, use of navigate in `onClick` are
> code smells.

```ts
import { navigate } from '@01edu/router-signal'

// Navigate to /users?tab=active
navigate({ href: '/users', params: { tab: 'active' } })

// Replace current entry and set a hash
navigate({ hash: 'details', replace: true })
```

Read the current URL reactively (no extra hooks or signals):

```ts
import { effect } from '@preact/signals'
import { url } from '@01edu/router-signal'

// All properties are signals, so it's reactive.
effect(() => {
  if (url.path === '/users') {
    // ...
  }

  console.log(url.hash) // e.g. "#details"
  console.log(url.params.page) // "2" | null
})

// Order-insensitive equality by origin, path, and query values
url.equals(new URL('/users?page=2', location.origin)) // true or false
```

## API

### `<A>`

Props:

- `href?: string` — target path or URL
- `hash?: string` — fragment without leading `#`
- `params?: Record<string, string | number | boolean | null | undefined>` —
  query updates
- `replace?: boolean` — use `history.replaceState` instead of `pushState`
- All standard Preact anchor attributes (`class`, `target`, `rel`, …)

Semantics for `params` values:

- `true` → include key with empty value (`?key`)
- `false` or `null`/`undefined` → remove key
- `string | number | boolean` → set as value (`?key=...`)

Examples:

```tsx
import { A, replaceParams } from '@01edu/router-signal';

// Merge params into the URL:
<A href="/users" params={{ page: 3 }}>Users page 3</A>

// Replace current params entirely:
<A href="/users" params={replaceParams({ page: 1, filter: true })}>
  Users page 1 (filter on)
</A>

// Clear all params:
<A href="/users" params={replaceParams()}>
  Users (no query)
</A>

// External and /api are normal links:
<A href="https://example.com">External</A>
<A href="/api/report.csv" download>
  Download CSV
</A>
```

Behavioral details:

- If `params` is omitted and you only change the hash (or keep the same path),
  current query parameters are preserved.
- Trailing slashes are removed from `href` automatically.

### `navigate(props)`

Programmatic client-side navigation.

```ts
type ParamValue = string | number | boolean | null | undefined;

navigate({
  href?: string,
  hash?: string,
  params?: Record<string, ParamValue>,
  replace?: boolean,
}): void
```

Examples:

```ts
import { navigate, replaceParams } from '@01edu/router-signal'

// Go to /users?tab=active
navigate({ href: '/users', params: { tab: 'active' } })

// Toggle a boolean flag (?filter):
navigate({ params: { filter: true } })
navigate({ params: { filter: false } })

// Replace current entry instead of pushing:
navigate({ hash: 'details', replace: true })

// Replace all params with just ?page=2&filter:
navigate({ params: replaceParams({ page: 2, filter: true }) })
```

Notes:

- If `params` is omitted and only `hash` changes, existing query params are
  preserved.
- URLs are normalized to drop trailing `/`.

### `replaceParams(newParams?)`

Replace the current query parameters wholesale. This returns an object suitable
for the `params` field in `navigate` or `<A>`.

```ts
replaceParams(newParams?: Record<string, string | number | boolean | null | undefined>): Record<string, ParamValue>
```

- Starts by “deleting” all existing query keys.
- Then applies `newParams` using the same semantics as `params`:
  - `true` → `?key`
  - `false | null | undefined` → remove key
  - other primitive → `?key=value`

> Internally this use a `computed` signals to only update if new params are
> added, not if there value changes

Examples:

```ts
import { navigate, replaceParams } from '@01edu/router-signal'

// Replace all params with page=2 and a boolean filter:
navigate({ params: replaceParams({ page: 2, filter: true }) })

// Clear all params:
navigate({ params: replaceParams() })
```

This eliminates accidental accumulation of stale keys when navigating across
views, important for "pages changes".

### `url`

A reactive view of the current URL. Reads are backed by signals internally, but
you don’t create or pass around any new signals or hooks yourself.

```ts
type Url = {
  path: string // pathname without trailing slash, e.g. "/users"
  hash: string // includes the leading "#", or "" if none
  params: Record<string, string | null> // enumerable, values are string|null
  equals: (u: URL) => boolean // same-origin, same path, same query values (order-insensitive)
}
```

Examples:

```ts
import { url } from '@01edu/router-signal'

function isUsers() {
  return url.path === '/users'
}

const page = url.params.page // "2" | null
const hasFilter = url.params.filter !== null

url.equals(new URL('/users?page=2', location.origin)) // true/false
```

Notes:

- `params` is a proxy exposing string-or-null values. It’s enumerable, so
  `Object.keys(url.params)` and `{ ...url.params }` work as expected.
- Query parameter ordering is ignored in `equals`.

## Patterns (without new state)

Because the URL is the state, you rarely need custom signals or hooks. A few
common patterns:

Active link:

```tsx
import { A, url } from '@01edu/router-signal'

<A
  href='/users'
  class={url.path === '/users' ? 'active' : undefined}
  aria-current={url.path === '/users' ? 'page' : undefined}
>
  Users
</A>
```

Filter toggle:

```tsx
import { A, url } from '@01edu/router-signal'

const isOn = url.params.filter !== null

<A params={{ filter: isOn ? false : true }}>
  {isOn ? 'Disable' : 'Enable'} filter
</A>
```

Pagination:

```tsx
import { A, url } from '@01edu/router-signal';

const current = Number(url.params.page ?? '1');
const next = current + 1;
const prev = Math.max(1, current - 1);

<A params={{ page: prev }}>Prev</A>
<A params={{ page: next }}>Next</A>
```

Replace vs merge:

```tsx
import { A, replaceParams } from '@01edu/router-signal';

// Merge: keep existing keys unless you override them
<A params={{ sort: 'name' }}>Sort by name</A>

// Replace: start fresh (prevents stale filters carrying over)
<A params={replaceParams({ sort: 'name' })}>Sort by name</A>
```

## Behavior and constraints

- Same-origin only: SPA navigation is performed for your origin and non-`/api/*`
  paths. External URLs and `/api/*` fall back to normal anchors.
- Trailing slashes are removed from paths to keep equality checks stable.
- Hash includes the leading `#` (e.g. `#details`), or `""` if none.
- Keyboard and modified-clicks behave like native anchors.
- Browser environment: this is designed for client-side apps (uses
  `window.history` and `location`).

## Philosophy

This library is intentionally small. The browser already gives you a robust
state container (the URL) and a navigation API (`history`).

We aim to provide a thin layer between preact signals and the browser URL, this
ensure your app are simpler to reason about, integrate better with the platform
and don’t invent new state for things the URL already models perfectly.

We volontarly have "bring your own" approach to things like validation,
typesafety, params assertion, and in most case found it wasn't even nescessary.

## License

MIT
